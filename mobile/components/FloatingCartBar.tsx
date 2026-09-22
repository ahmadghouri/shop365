import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { GradientPill } from '@/components/reusable/GradientPill';
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
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;
    const isUltraTinyScreen = width < 320;

    if (itemCount === 0) return null;

    const paddingX = isUltraTinyScreen ? 'px-2.5' : isSmallScreen ? 'px-4' : 'px-5';
    const innerPaddingPl = isUltraTinyScreen ? 'pl-3.5' : isTinyScreen ? 'pl-4' : isSmallScreen ? 'pl-5' : 'pl-6';
    const innerPaddingPr = isUltraTinyScreen ? 'pr-1' : isSmallScreen ? 'pr-1.5' : 'pr-2';
    const innerPaddingPy = isUltraTinyScreen ? 'py-1' : 'py-1.5';
    const textMarginR = isUltraTinyScreen ? 'mr-2.5' : isTinyScreen ? 'mr-3' : isSmallScreen ? 'mr-4' : 'mr-5';
    const textSize = isUltraTinyScreen ? 'text-[10px]' : isTinyScreen ? 'text-xs' : isSmallScreen ? 'text-sm' : 'text-base';
    const cartIconBox = isUltraTinyScreen ? 'h-9 w-9' : isTinyScreen ? 'h-10 w-10' : isSmallScreen ? 'h-11 w-11' : 'h-12 w-12';
    const cartIconSize = isUltraTinyScreen ? 18 : isTinyScreen ? 19 : isSmallScreen ? 21 : 23;

    return (
        <View
            pointerEvents="box-none"
            className={`absolute left-0 right-0 z-50 items-end ${paddingX}`}
            style={{ bottom }}
        >
            <View className="overflow-hidden rounded-full shadow-xl">
                <GradientPill className="rounded-full">
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Open cart with ${itemCount} items`}
                        className={`flex-row items-center ${innerPaddingPy} ${innerPaddingPl} ${innerPaddingPr} active:opacity-90`}
                        onPress={onPress}
                    >
                        <Text
                            className={`${textMarginR} ${textSize} font-lufga-bold`}
                            style={{ color: '#171717' }}
                        >
                            {itemCount} {itemCount === 1 ? 'item' : 'items'} · Rs{' '}
                            {subtotal.toLocaleString()}
                        </Text>
                        <View
                            className={`${cartIconBox} items-center justify-center rounded-full`}
                            style={{ backgroundColor: '#171717' }}
                        >
                            <ShoppingCart size={cartIconSize} color="#FCD34D" strokeWidth={2.5} />
                        </View>
                    </Pressable>
                </GradientPill>
            </View>
        </View>
    );
}
