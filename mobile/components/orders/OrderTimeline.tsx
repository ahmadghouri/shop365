import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

export const TRACK_STEPS = [
    'Order placed',
    'Order confirmed',
    'Preparing your order',
    'Picked up by rider',
    'Out for delivery',
    'Delivered',
];

const STEP_STATUS_KEYS = ['pending', 'confirmed', 'preparing', 'picked_up', 'out_for_delivery', 'delivered'];

export function statusToStep(status: string): number {
    switch (status) {
        case 'pending':                      return 0;
        case 'confirmed':                    return 1;
        case 'preparing': case 'processing': return 2;
        case 'picked_up': case 'shipped':    return 3;
        case 'out_for_delivery':             return 4;
        case 'delivered':                    return TRACK_STEPS.length;
        case 'cancelled':                    return -1;
        default:                             return 0;
    }
}

export function PingDot() {
    const scale   = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(scale,   { toValue: 2.6, duration: 1500, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0,   duration: 1500, useNativeDriver: true }),
                Animated.timing(scale,   { toValue: 1,   duration: 0,    useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.5, duration: 0,    useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    return (
        <Animated.View
            pointerEvents="none"
            className="absolute h-16 w-16 rounded-full bg-[#EAB308]"
            style={{ opacity, transform: [{ scale }] }}
        />
    );
}

type OrderTimelineProps = {
    status: string;
    cancelled: boolean;
    historyMap: Record<string, string>;
    createdAt: string;
};

export function OrderTimeline({ status, cancelled, historyMap, createdAt }: OrderTimelineProps) {
    const current = statusToStep(status);

    const getStepTime = (i: number): string => {
        const key = STEP_STATUS_KEYS[i];
        const at = historyMap[key] || (i === 0 ? createdAt : '');
        if (!at) return '';
        try {
            return new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    };

    return (
        <View className="mt-6 pb-4">
            {TRACK_STEPS.map((title, i) => {
                const done   = current >= TRACK_STEPS.length ? true : i < current;
                const active = !cancelled && i === current && current < TRACK_STEPS.length;
                const isLast = i === TRACK_STEPS.length - 1;

                return (
                    <View key={title} className="flex-row gap-3.5">
                        <View className="items-center">
                            <View className={`h-8 w-8 items-center justify-center rounded-full ${done ? 'bg-slate-900' : active ? 'bg-[#EAB308]' : 'bg-[#E5E5E5]'}`}>
                                {done ? (
                                    <Check size={16} color="#EAB308" strokeWidth={3} />
                                ) : active ? (
                                    <View className="h-3 w-3 rounded-full bg-[#141414]" />
                                ) : null}
                            </View>
                            {!isLast && (
                                <View
                                    className="h-9 w-0.5"
                                    style={{ backgroundColor: done ? '#1e1e2e' : '#E5E5E5' }}
                                />
                            )}
                        </View>
                        <View className="pb-5">
                            <Text className={`text-sm font-lufga-bold ${(active || done) ? 'text-[#141414]' : 'text-slate-400'}`}>
                                {title}
                            </Text>
                            {(done || active) && getStepTime(i) ? (
                                <Text className="text-xs font-lufga text-slate-400">{getStepTime(i)}</Text>
                            ) : null}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}
