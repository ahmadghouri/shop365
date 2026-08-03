import { Pressable, Text, View } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useCartStore } from '@/lib/cartStore';

type FloatingCartBarProps = {
    onPress: () => void;
    bottom?: number;
};

export function FloatingCartBar({ onPress, bottom = 24 }: FloatingCartBarProps) {
    const items = useCartStore((state) => state.items);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => {
        const extrasTotal = item.extras.reduce((extraSum, extra) => extraSum + extra.price, 0);
        return sum + (item.price + extrasTotal) * item.quantity;
    }, 0);

    if (itemCount === 0) return null;

    return (
        <View pointerEvents="box-none" className="absolute left-0 right-0 z-50 items-end px-5" style={{ bottom }}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open cart with ${itemCount} items`}
                className="flex-row items-center rounded-full bg-[#171717] py-2 pl-6 pr-2 shadow-xl active:opacity-90"
                onPress={onPress}
            >
                <Text className="mr-5 text-base font-lufga-bold text-white">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} · Rs {subtotal.toLocaleString()}
                </Text>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#FFC400]">
                    <ShoppingCart size={23} color="#171717" strokeWidth={2.5} />
                </View>
            </Pressable>
        </View>
    );
}