import { Text, View } from 'react-native';
import { PackageOpen } from 'lucide-react-native';
import { ProductCard } from '@/components/reusable/ProductCard';
import { AppColors } from '@/components/reusable/colors';

export type GridProduct = {
    id: string;
    name: string;
    store: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    discountType?: 'percentage' | 'flat';
    image?: any;
    imageUri?: string;
};

type ProviderProductGridProps = {
    products: GridProduct[];
    onProductPress?: (p: GridProduct) => void;
};

export function ProviderProductGrid({ products, onProductPress }: ProviderProductGridProps) {
    if (products.length === 0) {
        return (
            <View className="items-center px-5 py-12">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-amber-50 mb-3">
                    <PackageOpen size={30} color={AppColors.yellow} />
                </View>
                <Text className="text-sm font-lufga text-slate-500 text-center">
                    This provider has no products yet.
                </Text>
            </View>
        );
    }

    const rows: GridProduct[][] = [];
    for (let i = 0; i < products.length; i += 2) {
        rows.push(products.slice(i, i + 2));
    }

    return (
        <View className="px-5">
            {rows.map((row, rowIndex) => (
                <View key={rowIndex} className="flex-row" style={{ gap: 8 }}>
                    {[0, 1].map((col) => {
                        const p = row[col];
                        return (
                            <View key={col} className="flex-1">
                                {p ? (
                                    <ProductCard
                                        productId={p.id}
                                        name={p.name}
                                        store={p.store}
                                        price={p.price}
                                        originalPrice={p.originalPrice}
                                        discount={p.discount}
                                        discountType={p.discountType}
                                        image={p.image}
                                        imageUri={p.imageUri}
                                        onPress={() => onProductPress?.(p)}
                                    />
                                ) : null}
                            </View>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}
