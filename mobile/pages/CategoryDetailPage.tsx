import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '@/components/reusable/PageHeader';
import { AppBackground } from '@/components/AppBackground';
import { SearchBar } from '@/components/category/SearchBar';
import { FilterChips } from '@/components/category/FilterChips';
import { ProductCard } from '@/components/reusable/ProductCard';
import { useCategoryProducts } from '@/api/home/useHomeQueries';
import { API_BASE_URL } from '@/api/client';

type Product = {
    id: string;
    name: string;
    store: string;
    price: number;
    image?: any;
    imageUri?: string;
    tag?: string;
};

type CategoryDetailPageProps = {
    categoryId?: string;
    title?: string;
    subtitle?: string;
    onBack?: () => void;
    onProductPress?: (product: Product) => void;
    onAddToCart?: (product: Product) => void;
};

function productImageUri(product: any) {
    const path = product.image_url || product.image || '';
    if (!path) return undefined;
    if (/^https?:\/\//.test(path)) return path;
    const normalizedPath = path.startsWith('/') ? path : `/uploads/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
}

export function CategoryDetailPage({
    categoryId = '',
    title = 'Grocery',
    subtitle = 'Daily Essentials',
    onBack,
    onProductPress,
    onAddToCart,
}: CategoryDetailPageProps) {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isError, refetch } = useCategoryProducts(
        categoryId,
        activeFilter,
        debouncedSearch
    );

    const filters = useMemo(
        () => ['All', ...(data?.types || []).filter((type) => type !== 'All')],
        [data?.types]
    );

    useEffect(() => {
        if (activeFilter !== 'All' && !filters.includes(activeFilter)) {
            setActiveFilter('All');
        }
    }, [activeFilter, filters]);

    const products = useMemo<Product[]>(
        () =>
            (data?.products || []).map((product: any) => {
                const imageUri = productImageUri(product);
                return {
                    id: String(product.id || product._id),
                    name: product.title,
                    store: product.business_id?.name || 'SHOP365 Provider',
                    price: Number(product.final_price ?? product.price ?? 0),
                    tag: product.type,
                    imageUri,
                    image: imageUri ? { uri: imageUri } : undefined,
                };
            }),
        [data?.products]
    );

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <PageHeader
                    title={title}
                    subtitle={subtitle}
                    onBack={onBack}
                    backIconColor="#1e293b"
                />

                <SearchBar value={search} onChangeText={setSearch} />

                <FilterChips
                    filters={filters}
                    activeFilter={activeFilter}
                    onFilterPress={setActiveFilter}
                />

                <ScrollView
                    className="flex-1 mt-4"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {isLoading ? (
                        <View className="items-center py-12">
                            <ActivityIndicator size="large" color="#EAB308" />
                        </View>
                    ) : isError ? (
                        <View className="items-center px-5 py-12">
                            <Text
                                className="font-lufga text-center text-red-600"
                                onPress={() => refetch()}
                            >
                                Failed to load products. Tap to try again.
                            </Text>
                        </View>
                    ) : products.length === 0 ? (
                        <View className="items-center px-5 py-12">
                            <Text className="font-lufga text-center text-slate-500">
                                No products found in this category or filter.
                            </Text>
                        </View>
                    ) : (
                        <View className="px-5">
                            {(() => {
                                const rows: Product[][] = [];
                                for (let i = 0; i < products.length; i += 2) {
                                    rows.push(products.slice(i, i + 2));
                                }
                                return rows.map((row, rowIndex) => (
                                    <View key={rowIndex} className="flex-row" style={{ gap: 8 }}>
                                        {row[0] ? (
                                            <View className="flex-1">
                                                <ProductCard
                                                    key={row[0].id}
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
                                ));
                            })()}
                        </View>
                    )}

                    <View className="h-6" />
                </ScrollView>
            </SafeAreaView>
        </AppBackground>
    );
}
