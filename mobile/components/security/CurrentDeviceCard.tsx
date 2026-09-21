import { Pressable, Text, View } from 'react-native';
import { ChevronRight, Globe2, Smartphone } from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import type { LoginSession } from '@/api/auth/auth.service';
import { sessionLabel, sessionTime } from './utils';

type CurrentDeviceCardProps = {
    session: LoginSession;
    locationLabel?: string;
    onPress: () => void;
};

export function CurrentDeviceCard({ session, locationLabel, onPress }: CurrentDeviceCardProps) {
    return (
        <Pressable className="mb-6 active:opacity-80" onPress={onPress}>
            <GlassCard variant="light" className="rounded-3xl">
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
                            <Text
                                className="text-base font-lufga-bold text-slate-950"
                                numberOfLines={1}
                            >
                                {session.device}
                            </Text>
                            <Text className="mt-1 text-sm font-lufga-semibold text-emerald-600">
                                This device
                            </Text>
                        </View>
                        <ChevronRight size={20} color="#94a3b8" />
                    </View>
                    <Text className="mt-4 text-base font-lufga-semibold text-slate-800">
                        {locationLabel || sessionLabel(session)}
                    </Text>
                    <Text className="mt-1 text-sm font-lufga text-slate-500">
                        Last login: {sessionTime(session.logged_in_at)}
                    </Text>
                </View>
            </GlassCard>
        </Pressable>
    );
}
