import { View, Text, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
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

export function ProductCard({ name, store, price, productId, image, imageUri, onPress, onAddToCart }: ProductCardProps) {
    const { addItem } = useCartStore();

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
    return (
        <Pressable
            className="w-[190px] mb-4 rounded-3xl active:opacity-90"
            onPress={onPress}
        >
            <GlassCard variant='light' className='rounded-xl'>
                {/* Image Area */}
                <View className="relative w-full aspect-[175/129] p-1.5">
                    <ProductShapeImage
                        source={imageUri ? { uri: imageUri } : image}
                    />

                    {/* Add Button with white notch cutout */}
                    <View className="absolute -bottom-2 -right-2 w-[72px] h-[72px] rounded-[36px] items-center justify-center">
                        <Pressable
                            className="w-12 h-12 rounded-[24px] bg-app-yellow items-center justify-center active:opacity-80"
                            onPress={handleAddToCart}
                        >
                            <Plus size={24} color="#111827" />
                        </Pressable>
                    </View>
                </View>

                {/* Info */}
                <View className="px-2 pt-3 pb-2">
                    <Text className="text-lg font-lufga text-app-dark" numberOfLines={1}>{name}</Text>
                    <Text className="text-sm font-lufga font-light text-slate-400 mt-0.5" numberOfLines={1}>{store}</Text>
                    <Text className="text-2xl font-lufga font-semibold text-slate-800 text-right mt-3">
                        {price.toLocaleString()}
                    </Text>
                </View>
            </GlassCard>
        </Pressable>
    );
}
