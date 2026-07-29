import { View, Text } from 'react-native';
import { ProductCard } from './ProductCard';

type Product = {
    id: string;
    name: string;
    store: string;
    price: number;
    image?: any;
};

type TopSellingProductsProps = {
    products: Product[];
    onProductPress?: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
};

export function TopSellingProducts({ products, onProductPress, onAddToCart }: TopSellingProductsProps) {
    return (
        <View className="px-5 mt-6">
            <Text className="text-2xl font-medium font-lufga text-[#111827] mb-4">Top Selling products</Text>
            <View className="flex-row flex-wrap justify-between">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        name={product.name}
                        store={product.store}
                        price={product.price}
                        image={product.image}
                        onPress={() => onProductPress?.(product)}
                        onAddToCart={() => onAddToCart?.(product)}
                    />
                ))}
            </View>
        </View>
    );
}
