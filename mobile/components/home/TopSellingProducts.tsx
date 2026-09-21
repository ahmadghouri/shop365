import { View, Text } from 'react-native';
import { ProductCard } from '@/components/reusable/ProductCard';

type Product = {
    id: string;
    name: string;
    store: string;
    price: number;
    image?: any;
    imageUri?: string;
};

type TopSellingProductsProps = {
    products: Product[];
    onProductPress?: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
};

export function TopSellingProducts({
    products,
    onProductPress,
    onAddToCart,
}: TopSellingProductsProps) {
    const rows: Product[][] = [];
    for (let i = 0; i < products.length; i += 2) {
        rows.push(products.slice(i, i + 2));
    }
    return (
        <View className="px-5 mt-6">
            <Text className="text-2xl font-medium font-lufga text-[#111827] mb-4">
                Top Selling products
            </Text>
            <View>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-row" style={{ gap: 8 }}>
                        {row[0] && (
                            <View className="flex-1">
                                <ProductCard
                                    key={row[0].id}
                                    productId={row[0].id}
                                    name={row[0].name}
                                    store={row[0].store}
                                    price={row[0].price}
                                    image={row[0].image}
                                    imageUri={row[0].imageUri}
                                    onPress={() => onProductPress?.(row[0])}
                                    onAddToCart={() => onAddToCart?.(row[0])}
                                />
                            </View>
                        )}
                        {row[1] && (
                            <View className="flex-1">
                                <ProductCard
                                    key={row[1].id}
                                    productId={row[1].id}
                                    name={row[1].name}
                                    store={row[1].store}
                                    price={row[1].price}
                                    image={row[1].image}
                                    imageUri={row[1].imageUri}
                                    onPress={() => onProductPress?.(row[1])}
                                    onAddToCart={() => onAddToCart?.(row[1])}
                                />
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}
