import { View, Text, Pressable } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import { GradientPill } from '@/components/reusable/GradientPill';

type QuantitySelectorProps = {
    quantity: number;
    min?: number;
    max?: number;
    onChange: (quantity: number) => void;
};

export function QuantitySelector({ quantity, min = 1, max = 99, onChange }: QuantitySelectorProps) {
    const canDecrease = quantity > min;
    const canIncrease = quantity < max;

    return (
        <View className="flex-row items-center !rounded-full bg-[#FFFFFF59] border border-white p-1">
            <Pressable
                accessibilityLabel="Decrease quantity"
                disabled={!canDecrease}
                className={`h-9 w-9 items-center justify-center rounded-full bg-[#FFFFFF] ${canDecrease ? '' : ''}`}
                onPress={() => onChange(quantity - 1)}
            >
                <Minus size={18} color="#1e293b" strokeWidth={2.5} />
            </Pressable>

            <Text className="mx-4 min-w-6 text-center text-base font-lufga-medium text-slate-900">
                {quantity}
            </Text>

            <GradientPill className={`rounded-full h-9 w-9 ${canIncrease ? '' : 'opacity-40'}`}>
                <Pressable
                    accessibilityLabel="Increase quantity"
                    disabled={!canIncrease}
                    className="flex-1 items-center justify-center active:opacity-70"
                    onPress={() => onChange(quantity + 1)}
                >
                    <Plus size={18} color="#111827" strokeWidth={2.5} />
                </Pressable>
            </GradientPill>
        </View>
    );
}
