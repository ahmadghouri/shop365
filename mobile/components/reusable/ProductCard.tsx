import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Plus } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { GradientPill } from './GradientPill';
import ProductShapeImage from './ProductShapeImage';
import { useCartStore } from '@/lib/cartStore';

type ProductCardProps = {
    name: string;
    store: string;
    price: number;
    productId?: string;
    image?: any;
    imageUri?: string;
    onPress?: () => void;
    onAddToCart?: () => void;
};

export function ProductCard({
    name,
    store,
    price,
    productId,
    image,
    imageUri,
    onPress,
    onAddToCart,
}: ProductCardProps) {
    const { addItem } = useCartStore();
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;
    const isUltraTinyScreen = width < 320;

    const handleAddToCart = async () => {
        if (productId) {
            await addItem({
                productId,
                name,
                store,
                price,
                quantity: 1,
                image,
                imageUri,
                extras: [],
            });
        }
        onAddToCart?.();
    };

    const notchSize = isUltraTinyScreen ? 'w-[50px] h-[50px]' : isTinyScreen ? 'w-[56px] h-[56px]' : isSmallScreen ? 'w-[64px] h-[64px]' : 'w-[72px] h-[72px]';
    const notchRadius = isUltraTinyScreen ? 'rounded-[25px]' : isTinyScreen ? 'rounded-[28px]' : isSmallScreen ? 'rounded-[32px]' : 'rounded-[36px]';
    const btnSize = isUltraTinyScreen ? 'w-8 h-8' : isTinyScreen ? 'w-9 h-9' : isSmallScreen ? 'w-10 h-10' : 'w-12 h-12';
    const btnRadius = isUltraTinyScreen ? 'rounded-[16px]' : isTinyScreen ? 'rounded-[18px]' : isSmallScreen ? 'rounded-[20px]' : 'rounded-[24px]';
    const plusSize = isUltraTinyScreen ? 16 : isTinyScreen ? 18 : isSmallScreen ? 20 : 24;
    const nameFontSize = isUltraTinyScreen ? 'text-[13px]' : isTinyScreen ? 'text-[14px]' : isSmallScreen ? 'text-[15px]' : 'text-lg';
    const storeFontSize = isUltraTinyScreen ? 'text-[10px]' : isTinyScreen ? 'text-[11px]' : isSmallScreen ? 'text-xs' : 'text-sm';
    const priceFontSize = isUltraTinyScreen ? 'text-base' : isTinyScreen ? 'text-lg' : isSmallScreen ? 'text-xl' : 'text-2xl';
    const infoPadding = isUltraTinyScreen ? 'px-1 pt-1.5 pb-1' : isTinyScreen ? 'px-1.5 pt-2 pb-1.5' : isSmallScreen ? 'px-2 pt-2.5 pb-2' : 'px-2 pt-3 pb-2';
    const imagePadding = isUltraTinyScreen ? 'p-0.5' : isTinyScreen ? 'p-1' : 'p-1.5';
    const btnOffset = isUltraTinyScreen ? '-bottom-1 -right-1' : isTinyScreen ? '-bottom-1.5 -right-1.5' : '-bottom-2 -right-2';
    const priceMarginTop = isUltraTinyScreen ? 'mt-1.5' : isTinyScreen ? 'mt-2' : isSmallScreen ? 'mt-2.5' : 'mt-3';

    return (
        <Pressable className="w-full mb-4 rounded-3xl active:opacity-90" onPress={onPress}>
            <GlassCard variant="light" className="rounded-xl">
                <View className={`relative w-full aspect-[175/129] ${imagePadding}`}>
                    <ProductShapeImage source={imageUri ? { uri: imageUri } : image} />

                    <View className={`absolute ${btnOffset} ${notchSize} ${notchRadius} items-center justify-center`}>
                        <View className={`${btnSize} ${btnRadius} overflow-hidden`}>
                            <GradientPill className={`w-full h-full ${btnRadius}`}>
                                <Pressable
                                    className="w-full h-full items-center justify-center active:opacity-80"
                                    onPress={handleAddToCart}
                                >
                                    <Plus size={plusSize} color="#111827" />
                                </Pressable>
                            </GradientPill>
                        </View>
                    </View>
                </View>

                <View className={infoPadding}>
                    <Text className={`${nameFontSize} font-lufga text-app-dark`} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text
                        className={`${storeFontSize} font-lufga font-light text-slate-400 mt-0.5`}
                        numberOfLines={1}
                    >
                        {store}
                    </Text>
                    <Text className={`${priceFontSize} font-lufga font-semibold text-slate-800 text-right ${priceMarginTop}`}>
                        {price.toLocaleString()}
                    </Text>
                </View>
            </GlassCard>
        </Pressable>
    );
}
