import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Globe2, Smartphone } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';
import type { LoginSession } from '@/api/auth/auth.service';
import { formatLoginDate, sessionLabel } from './utils';

type SessionDetailViewProps = {
    session: LoginSession;
    locationLabel?: string;
    isCurrentSession: boolean;
    deviceHistory: LoginSession[];
    locationLabels: Record<string, string>;
    onBack: () => void;
    onLogoutDevice: () => void;
    onSelectHistorySession: (s: LoginSession) => void;
};

export function SessionDetailView({
    session,
    locationLabel,
    isCurrentSession,
    deviceHistory,
    locationLabels,
    onBack,
    onLogoutDevice,
    onSelectHistorySession,
}: SessionDetailViewProps) {
    const selectedLocation = locationLabel || sessionLabel(session);
    const isPastSession = !!session.logged_out_at;

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
                    <Text className="text-2xl font-lufga-bold text-slate-950">Login Details</Text>
                </View>

                <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 32 }}>
                    <Text className="text-2xl font-lufga-bold text-slate-950">
                        Logins on {session.device || `${session.platform} device`}
                    </Text>
                    <Text className="mt-2 mb-6 text-sm leading-5 font-lufga text-slate-500">
                        {isPastSession
                            ? 'This is a past login from your account.'
                            : "We'll help you secure your account in case you see a login you don't recognize."}
                    </Text>

                    <GlassCard variant="light" className="rounded-3xl mb-6">
                        <View className="p-5">
                            <View className="flex-row items-center">
                                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                                    {session.platform === 'web' ? (
                                        <Globe2 size={23} color="#b77900" />
                                    ) : (
                                        <Smartphone size={23} color="#b77900" />
                                    )}
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-base font-lufga-bold text-slate-950">
                                        {session.device || `${session.platform} device`}
                                    </Text>
                                    {isCurrentSession ? (
                                        <Text className="mt-1 text-sm font-lufga-semibold text-emerald-600">
                                            This device
                                        </Text>
                                    ) : null}
                                </View>
                            </View>
                            <Text className="mt-5 text-base font-lufga-semibold text-slate-950">
                                {selectedLocation}
                            </Text>
                            <Text className="mt-1 text-sm font-lufga text-slate-500">
                                Last login: {formatLoginDate(session.logged_in_at)}
                            </Text>

                            {!isCurrentSession && !isPastSession ? (
                                <GradientPill className="rounded-full h-12 mt-5">
                                    <Pressable
                                        className="flex-1 items-center justify-center active:opacity-80"
                                        onPress={onLogoutDevice}
                                    >
                                        <Text className="text-sm font-lufga-semibold text-slate-900">
                                            Log out
                                        </Text>
                                    </Pressable>
                                </GradientPill>
                            ) : null}
                        </View>
                    </GlassCard>

                    {deviceHistory.length > 0 ? (
                        <>
                            <Text className="mb-3 text-lg font-lufga-bold text-slate-950">
                                Recent logins
                            </Text>
                            <GlassCard variant="light" className="rounded-3xl overflow-hidden">
                                {deviceHistory.map((s, i, arr) => {
                                    const loc = locationLabels[s._id] || sessionLabel(s);
                                    const isLast = i === arr.length - 1;
                                    return (
                                        <Pressable
                                            key={s._id}
                                            className={`px-4 py-4 active:opacity-60 ${isLast ? '' : 'border-b border-white/60'}`}
                                            onPress={() => onSelectHistorySession(s)}
                                        >
                                            <Text className="text-base font-lufga-semibold text-slate-950">
                                                {loc}
                                            </Text>
                                            <Text className="mt-0.5 text-sm font-lufga text-slate-500">
                                                {formatLoginDate(s.logged_in_at)}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </GlassCard>
                        </>
                    ) : null}
                </ScrollView>
            </SafeAreaView>
        </AppBackground>
    );
}
