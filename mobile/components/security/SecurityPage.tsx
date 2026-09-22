import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/reusable/GlassCard';
import { ConfirmActionModal } from '@/components/reusable/ConfirmActionModal';
import {
    getLoginSessions,
    logoutAllSessions,
    logoutCurrentSession,
    logoutSession,
    type LoginSession,
} from '@/api/auth/auth.service';
import { useAuthStore } from '@/lib/authStore';
import { sessionLabel } from './utils';
import { SessionRow } from './SessionRow';
import { CurrentDeviceCard } from './CurrentDeviceCard';
import { SessionDetailView } from './SessionDetailView';

type SecurityPageProps = {
    onBack: () => void;
    onLogout: () => void;
};

export function SecurityPage({ onBack, onLogout }: SecurityPageProps) {
    const [sessions, setSessions] = useState<LoginSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
    const [locationLabels, setLocationLabels] = useState<Record<string, string>>({});
    const [selectedSession, setSelectedSession] = useState<LoginSession | null>(null);
    const [confirmLogoutId, setConfirmLogoutId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [logoutInFlight, setLogoutInFlight] = useState(false);

    useEffect(() => {
        getLoginSessions()
            .then(async (result) => {
                setSessions(result.sessions);
                setCurrentSessionId(result.currentSessionId);
                const nextSessions = result.sessions;
                const resolved = await Promise.all(
                    nextSessions.map(async (session) => {
                        if (
                            session.geo?.city ||
                            session.geo?.latitude == null ||
                            session.geo?.longitude == null
                        )
                            return null;
                        try {
                            const [place] = await Location.reverseGeocodeAsync({
                                latitude: session.geo.latitude,
                                longitude: session.geo.longitude,
                            });
                            const label = place?.city || place?.region || place?.district || '';
                            return label ? ([session._id, label] as const) : null;
                        } catch {
                            return null;
                        }
                    })
                );
                setLocationLabels(
                    Object.fromEntries(resolved.filter(Boolean) as [string, string][])
                );
            })
            .catch(() => Alert.alert('Could not load security', 'Please try again later.'))
            .finally(() => setLoading(false));
    }, []);

    const matchesSameDeviceOrIp = (reference: LoginSession) => (s: LoginSession) => {
        if (s._id === currentSessionId) return false;
        if (reference.device && s.device === reference.device) return true;
        if (reference.ip_address && s.ip_address === reference.ip_address) return true;
        return false;
    };

    const handleLogout = async (sessionId: string) => {
        if (logoutInFlight) return;
        const reference = sessions.find((s) => s._id === sessionId);
        if (!reference) return;
        try {
            if (reference._id === currentSessionId) {
                setLogoutInFlight(true);
                await logoutCurrentSession();
                await useAuthStore.getState().logout();
                onLogout();
                return;
            }
            await handleLogoutDevice(reference);
        } catch {
            Alert.alert('Could not log out', 'Please try again.');
        } finally {
            setLogoutInFlight(false);
        }
    };

    const handleLogoutAll = async () => {
        if (logoutInFlight) return;
        try {
            setLogoutInFlight(true);
            await logoutAllSessions();
            const now = new Date().toISOString();
            setSessions((current) =>
                current.map((session) =>
                    session._id !== currentSessionId
                        ? { ...session, logged_out_at: now, is_active: false }
                        : session
                )
            );
        } catch {
            Alert.alert('Could not log out devices', 'Please try again.');
        } finally {
            setLogoutInFlight(false);
        }
    };

    const handleLogoutDevice = async (session: LoginSession) => {
        if (logoutInFlight) return;
        try {
            setLogoutInFlight(true);
            const isMatch = matchesSameDeviceOrIp(session);
            const ids = new Set(
                sessions.filter((s) => isMatch(s)).map((s) => s._id)
            );
            ids.add(session._id);
            const needsRevoke = Array.from(ids)
                .map((id) => sessions.find((s) => s._id === id))
                .filter(
                    (s): s is LoginSession =>
                        Boolean(s) && s.is_active !== false && !s.logged_out_at
                );

            for (const t of needsRevoke) {
                try {
                    await logoutSession(t._id);
                } catch {
                    // Continue with remaining sessions
                }
            }

            const revokedIds = new Set(needsRevoke.map((s) => s._id));
            const now = new Date().toISOString();
            setSessions((current) =>
                current.map((s) =>
                    revokedIds.has(s._id) && !s.logged_out_at
                        ? { ...s, logged_out_at: now, is_active: false }
                        : s
                )
            );
            setSelectedSession(null);
        } catch {
            Alert.alert('Could not log out', 'Please try again.');
        } finally {
            setLogoutInFlight(false);
        }
    };

    const currentSession = sessions.find((session) => session._id === currentSessionId);
    const allOtherSessions = sessions.filter((session) => session._id !== currentSessionId);

    const uniqueDeviceKey = (s: LoginSession) =>
        (s.device || '').toLowerCase() + '|' + (s.ip_address || '');
    const dedupeByDevice = (list: LoginSession[]) => {
        const map = new Map<string, LoginSession>();
        for (const s of list) {
            const key = uniqueDeviceKey(s);
            const prev = map.get(key);
            if (
                !prev ||
                new Date(s.logged_in_at).getTime() > new Date(prev.logged_in_at).getTime()
            ) {
                map.set(key, s);
            }
        }
        return Array.from(map.values()).sort(
            (a, b) => new Date(b.logged_in_at).getTime() - new Date(a.logged_in_at).getTime()
        );
    };
    const otherActiveSessions = dedupeByDevice(allOtherSessions);

    if (selectedSession) {
        const deviceHistory = sessions
            .filter(
                (s) =>
                    s._id !== selectedSession._id &&
                    (s.device === selectedSession.device ||
                        (selectedSession.ip_address && s.ip_address === selectedSession.ip_address))
            )
            .sort(
                (a, b) => new Date(b.logged_in_at).getTime() - new Date(a.logged_in_at).getTime()
            );

        return (
            <SessionDetailView
                session={selectedSession}
                locationLabel={locationLabels[selectedSession._id] || sessionLabel(selectedSession)}
                isCurrentSession={selectedSession._id === currentSessionId}
                deviceHistory={deviceHistory}
                locationLabels={locationLabels}
                onBack={() => setSelectedSession(null)}
                onLogoutDevice={() => handleLogoutDevice(selectedSession)}
                onSelectHistorySession={setSelectedSession}
            />
        );
    }

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <View className="flex-row items-center px-5 pb-4 pt-2">
                    <Pressable
                        className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-white/70 active:opacity-60"
                        onPress={onBack}
                    >
                        <ChevronLeft size={23} color="#171717" />
                    </Pressable>
                    <Text className="text-2xl font-lufga-bold text-slate-950">Security</Text>
                </View>

                <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
                    <Text className="mb-1 text-2xl font-lufga-bold text-slate-950">
                        Account login activity
                    </Text>
                    <Text className="mb-5 text-base font-lufga text-slate-500">
                        You are currently logged in on these devices:
                    </Text>

                    {loading ? (
                        <ActivityIndicator color="#EAB308" />
                    ) : sessions.length === 0 ? (
                        <GlassCard variant="light" className="rounded-3xl">
                            <View className="p-5">
                                <Text className="text-center font-lufga text-slate-500">
                                    No login activity found.
                                </Text>
                            </View>
                        </GlassCard>
                    ) : (
                        <>
                            {currentSession ? (
                                <CurrentDeviceCard
                                    session={currentSession}
                                    locationLabel={locationLabels[currentSession._id]}
                                    onPress={() => setSelectedSession(currentSession)}
                                />
                            ) : null}

                            {otherActiveSessions.length > 0 ? (
                                <>
                                    <Text className="mb-3 text-lg font-lufga-bold text-slate-950">
                                        Logins on other devices
                                    </Text>
                                    <GlassCard
                                        variant="light"
                                        className="rounded-3xl overflow-hidden mb-6"
                                    >
                                        {otherActiveSessions.map((s, i, arr) => (
                                            <SessionRow
                                                key={s._id}
                                                session={s}
                                                locationLabel={locationLabels[s._id]}
                                                onPress={() => setSelectedSession(s)}
                                                isLast={i === arr.length - 1}
                                            />
                                        ))}
                                    </GlassCard>
                                </>
                            ) : null}

                            {allOtherSessions.some(
                                (s) => s.is_active !== false && !s.logged_out_at
                            ) ? (
                                <Pressable className="mb-4 py-3" onPress={handleLogoutAll}>
                                    <Text className="text-center text-base font-lufga-semibold text-red-600">
                                        Log out all other devices
                                    </Text>
                                </Pressable>
                            ) : null}
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        </AppBackground>
    );
}
