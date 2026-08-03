import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { QuantitySelector } from '@/components/product/QuantitySelector';
import { ExtrasList, type Extra } from '@/components/product/ExtrasList';
import { useCartStore } from '@/lib/cartStore';

type Variant = {
    id: string;
    name: string;
    price: number;
};

type ProductDetailPayload = {
    quantity: number;
    extras: Extra[];
    total: number;
    variant?: Variant;
};

type ProductDetailPageProps = {
    productId?: string;
    name?: string;
    store?: string;
    price?: number;
    oldPrice?: number;
    description?: string;
    image?: any;
    imageUri?: string;
    extras?: Extra[];
    variants?: Variant[];
    onBack?: () => void;
    onAddToCart?: (payload: ProductDetailPayload) => void;
    onBuyNow?: (payload: ProductDetailPayload) => void;
};

const DEFAULT_EXTRAS: Extra[] = [
    { id: 'cheese', name: 'Extra Cheese', price: 60 },
    { id: 'patty', name: 'Extra Patty', price: 150 },
    { id: 'fries', name: 'Fries', price: 120 },
    { id: 'drink', name: 'Cold Drink', price: 80 },
];

export function ProductDetailPage({
    productId = 'preview-product',
    name = 'Cheese Beef Burger',
    store = '365 Fast Food',
    price = 390,
    oldPrice = 475,
    description = 'A standard burger product description highlights a savory meat or plant patty, fresh crisp toppings, and a soft toasted bun.',
    image = require('@/assets/product/product.png'),
    imageUri,
    extras = DEFAULT_EXTRAS,
    variants = [],
    onBack,
    onAddToCart,
    onBuyNow,
}: ProductDetailPageProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
    const [selectedVariantId, setSelectedVariantId] = useState('');

    useEffect(() => {
        setQuantity(1);
        setSelectedExtraIds([]);
        setSelectedVariantId(variants[0]?.id || '');
    }, [productId, variants]);

    const selectedVariant = useMemo(
        () => variants.find((variant) => variant.id === selectedVariantId),
        [variants, selectedVariantId],
    );
    const unitPrice = selectedVariant?.price ?? price;
    const effectiveOldPrice = selectedVariant ? undefined : oldPrice;
    const source = imageUri ? { uri: imageUri } : image;

    const discount = useMemo(() => {
        if (!effectiveOldPrice || effectiveOldPrice <= unitPrice) return null;
        return Math.round(((effectiveOldPrice - unitPrice) / effectiveOldPrice) * 100);
    }, [effectiveOldPrice, unitPrice]);

    const selectedExtras = useMemo(
        () => extras.filter((extra) => selectedExtraIds.includes(extra.id)),
        [extras, selectedExtraIds],
    );

    const total = useMemo(() => {
        const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
        return (unitPrice + extrasTotal) * quantity;
    }, [unitPrice, selectedExtras, quantity]);

    const toggleExtra = (extraId: string) => {
        setSelectedExtraIds((current) =>
            current.includes(extraId)
                ? current.filter((id) => id !== extraId)
                : [...current, extraId],
        );
    };

    const payload: ProductDetailPayload = {
        quantity,
        extras: selectedExtras,
        total,
        variant: selectedVariant,
    };

    const addItem = useCartStore((state) => state.addItem);

    const addCurrentSelection = () => {
        addItem({
            productId: productId,
            name: name ?? 'Product',
            store: store ?? '',
            price: unitPrice,
            quantity,
            image,
            imageUri,
            extras: selectedExtras,
            variant: selectedVariant,
        });
    };

    const handleAddToCart = () => {
        addCurrentSelection();
        onAddToCart?.(payload);
    };

    const handleBuyNow = () => {
        addCurrentSelection();
        onBuyNow?.(payload);
    };

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="mx-4 mt-2 rounded-3xl bg-white/70 p-3">
                        <View className="h-64 items-center justify-center overflow-hidden rounded-2xl bg-[#F0F0F0]">
                            {source ? (
                                <Image source={source} className="h-full w-full" resizeMode="contain" />
                            ) : (
                                <Text className="text-5xl">🍔</Text>
                            )}
                        </View>

                        {onBack && (
                            <Pressable
                                accessibilityLabel="Go back"
                                className="absolute left-5 top-5 h-10 w-10 items-center justify-center rounded-full bg-white/90 active:opacity-70"
                                onPress={onBack}
                            >
                                <ChevronLeft size={22} color="#1e293b" />
                            </Pressable>
                        )}
                    </View>

                    <View className="px-5 pt-4">
                        <Text className="text-xs font-lufga text-slate-400">{store}</Text>
                        <Text className="mt-1 text-2xl font-lufga-bold text-slate-900">{name}</Text>

                        <View className="mt-3 flex-row items-center">
                            <Text className="text-3xl font-lufga-bold text-slate-900">
                                Rs {unitPrice.toLocaleString()}
                            </Text>

                            {effectiveOldPrice && effectiveOldPrice > unitPrice && (
                                <Text className="ml-3 text-lg font-lufga text-slate-400 line-through">
                                    Rs {effectiveOldPrice.toLocaleString()}
                                </Text>
                            )}

                            {discount !== null && (
                                <View className="ml-4 rounded-full bg-emerald-100 px-4 py-1.5">
                                    <Text className="text-sm font-lufga-medium text-emerald-700">
                                        {discount}% OFF
                                    </Text>
                                </View>
                            )}
                        </View>

                        {variants.length > 0 && (
                            <View className="mt-6">
                                <Text className="text-base font-lufga-semibold text-slate-900">
                                    Sizes / Variants
                                </Text>
                                <View className="mt-3 flex-row flex-wrap gap-2">
                                    {variants.map((variant) => {
                                        const isSelected = variant.id === selectedVariantId;
                                        return (
                                            <Pressable
                                                key={variant.id}
                                                className={isSelected
                                                    ? 'rounded-full border border-[#EAB308] bg-[#FEF3C7] px-4 py-2.5'
                                                    : 'rounded-full border border-slate-200 bg-white px-4 py-2.5'}
                                                onPress={() => setSelectedVariantId(variant.id)}
                                            >
                                                <Text className={isSelected
                                                    ? 'font-lufga-medium text-slate-900'
                                                    : 'font-lufga text-slate-600'}
                                                >
                                                    {variant.name} · Rs {variant.price.toLocaleString()}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        <View className="mt-6 flex-row items-center justify-between">
                            <Text className="text-base font-lufga-semibold text-slate-900">Quantity</Text>
                            <QuantitySelector quantity={quantity} onChange={setQuantity} />
                        </View>

                        <View className="mt-6">
                            <Text className="text-base font-lufga-semibold text-slate-900">Description</Text>
                            <Text className="mt-2 text-[15px] font-lufga leading-6 text-slate-400">
                                {description}
                            </Text>
                        </View>

                        {extras.length > 0 && (
                            <ExtrasList
                                extras={extras}
                                selectedIds={selectedExtraIds}
                                onToggle={toggleExtra}
                            />
                        )}
                    </View>

                    <View className="h-32" />
                </ScrollView>

                <View className="absolute bottom-0 left-0 right-0 flex-row gap-3 border-t border-slate-100 bg-white px-4 pb-7 pt-3">
                    <Pressable
                        className="flex-1 items-center justify-center rounded-full bg-[#FEF3C7] py-4 active:opacity-80"
                        onPress={handleAddToCart}
                    >
                        <Text className="text-[15px] font-lufga-medium text-slate-800">
                            ADD - RS:{total.toLocaleString()}
                        </Text>
                    </Pressable>

                    <Pressable
                        className="flex-1 items-center justify-center rounded-full bg-[#EAB308] py-4 active:opacity-80"
                        onPress={handleBuyNow}
                    >
                        <Text className="text-[15px] font-lufga-semibold text-slate-900">Buy Now</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </AppBackground>
    );
}
