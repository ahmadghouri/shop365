import { View, Text, Pressable, Image } from 'react-native';
import { Plus } from 'lucide-react-native';

type ProductCardProps = {
    name: string;
    store: string;
    price: number;
    image?: any;
    imageUri?: string;
    onPress?: () => void;
    onAddToCart?: () => void;
};

export function ProductCard({ name, store, price, image, imageUri, onPress, onAddToCart }: ProductCardProps) {
    return (
        <Pressable
            className="w-[48%] mb-4 rounded-3xl bg-[#FFFDF8] p-2 active:opacity-90"
            onPress={onPress}
        >
            {/* Image Area */}
            <View className="relative">
                <View className="rounded-2xl bg-[#F0F0F0] h-36 items-center justify-center overflow-hidden">
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="contain" />
                    ) : image ? (
                        <Image source={image} className="w-full h-full" resizeMode="contain" />
                    ) : (
                        <Text className="text-4xl">🛒</Text>
                    )}
                </View>

                {/* Add Button with white notch cutout */}
                <View className="absolute -bottom-2 -right-2 w-[72px] h-[72px] rounded-[36px] bg-[#FFFDF8] items-center justify-center">
                    <Pressable
                        className="w-12 h-12 rounded-[24px] bg-[#EAB308] items-center justify-center active:opacity-80"
                        onPress={onAddToCart}
                    >
                        <Plus size={28} color="#111827" strokeWidth={3.5} />
                    </Pressable>
                </View>
            </View>

            {/* Info */}
            <View className="px-2 pt-3 pb-2">
                <Text className="text-lg font-lufga text-slate-800" numberOfLines={1}>{name}</Text>
                <Text className="text-sm font-lufga font-light text-slate-400 mt-0.5" numberOfLines={1}>{store}</Text>
                <Text className="text-2xl font-lufga font-semibold text-slate-800 text-right mt-3">
                    {price.toLocaleString()}
                </Text>
            </View>
        </Pressable>
    );
}
