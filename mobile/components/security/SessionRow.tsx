import { Pressable, Text, View } from 'react-native';
import { ChevronRight, Globe2, Smartphone } from 'lucide-react-native';
import type { LoginSession } from '@/api/auth/auth.service';
import { relativeSessionTime, sessionLabel } from './utils';

type SessionRowProps = {
    session: LoginSession;
    locationLabel?: string;
    onPress: () => void;
    isLast?: boolean;
};

export function SessionRow({ session, locationLabel, onPress, isLast = false }: SessionRowProps) {
    return (
        <Pressable
            className={`flex-row items-center px-4 py-4 active:opacity-60 ${isLast ? '' : 'border-b border-slate-100'}`}
            onPress={onPress}
        >
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-amber-50">
                {session.platform === 'web' ? (
                    <Globe2 size={21} color="#b77900" />
                ) : (
                    <Smartphone size={21} color="#b77900" />
                )}
            </View>
            <View className="ml-3 flex-1">
                <Text className="text-base font-lufga-semibold text-slate-950" numberOfLines={1}>
                    {session.device || `${session.platform} device`}
                </Text>
                <Text className="mt-1 text-sm font-lufga text-slate-500">
                    {locationLabel || sessionLabel(session)} ·{' '}
                    {relativeSessionTime(session.logged_in_at)}
                </Text>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
        </Pressable>
    );
}
