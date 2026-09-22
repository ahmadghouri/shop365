import { View, Text, useWindowDimensions } from 'react-native';
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
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;
    const isUltraTinyScreen = width < 320;

    const rows: Product[][] = [];
    for (let i = 0; i < products.length; i += 2) {
        rows.push(products.slice(i, i + 2));
    }

    const paddingX = isUltraTinyScreen ? 'px-3' : isSmallScreen ? 'px-4' : 'px-5';
    const marginTop = isUltraTinyScreen
        ? 'mt-4'
        : isTinyScreen
            ? 'mt-4.5'
            : isSmallScreen
                ? 'mt-5'
                : 'mt-6';
    const headingSize = isUltraTinyScreen
        ? 'text-lg'
        : isTinyScreen
            ? 'text-[17px]'
            : isSmallScreen
                ? 'text-xl'
                : 'text-2xl';
    const marginBottom = isUltraTinyScreen
        ? 'mb-2'
        : isTinyScreen
            ? 'mb-2.5'
            : isSmallScreen
                ? 'mb-3'
                : 'mb-4';
    const rowGap = isUltraTinyScreen ? 4 : isTinyScreen ? 5 : isSmallScreen ? 6 : 8;

    return (
        <View className={`${paddingX} ${marginTop}`}>
            <Text
                className={`${headingSize} font-medium font-lufga text-[#111827] ${marginBottom}`}
            >
                Top Selling products
            </Text>
            <View>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-row" style={{ gap: rowGap }}>
                        {row[0] ? (
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
                        ) : (
                            <View className="flex-1" />
                        )}
                        {row[1] ? (
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
                        ) : (
                            <View className="flex-1" />
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}
