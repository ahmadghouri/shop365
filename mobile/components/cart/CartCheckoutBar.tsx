import { Pressable, Text, View } from 'react-native';
import { GradientPill } from '@/components/reusable/GradientPill';

type Props = {
    total: number;
    onCheckout: () => void;
};

/** Sticky bottom checkout bar with the gradient CTA. */
export function CartCheckoutBar({ total, onCheckout }: Props) {
    return (
        <View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-5 pb-7 pt-3">
            <Pressable className="active:opacity-80" onPress={onCheckout}>
                <GradientPill className="rounded-full">
                    <View className="flex-1 items-center justify-center py-4">
                        <Text className="text-base font-lufga-semibold text-slate-900">
                            Checkout - Rs {total.toLocaleString()}
                        </Text>
                    </View>
                </GradientPill>
            </Pressable>
        </View>
    );
}
