import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    Pressable,
    ScrollView,
    Text,
    View,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { PageHeader } from '@/components/reusable/PageHeader';
import { AppBackground } from '@/components/AppBackground';
import { SearchBar } from '@/components/category/SearchBar';
import { FilterChips } from '@/components/category/FilterChips';
import { ProductCard } from '@/components/reusable/ProductCard';
import { CategoryProviders } from '@/components/provider-detail/CategoryProviders';
import { useCategoryProducts } from '@/api/home/useHomeQueries';
import { API_BASE_URL } from '@/api/client';

type Product = {
    id: string;
    name: string;
    store: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    discountType?: 'percentage' | 'flat';
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
    onProviderPress?: (provider: { id: string; name: string }) => void;
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
    onProviderPress,
}: CategoryDetailPageProps) {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    // Filter that actually drives the API call — updated ~1s after the user
    // taps a chip so we don't fire a request on every quick tap.
    const [debouncedFilter, setDebouncedFilter] = useState('All');

    // Collapse the search bar on scroll down, reveal it on scroll up. When
    // hidden, a search icon appears in the header to bring it back.
    const [searchVisible, setSearchVisible] = useState(true);
    const searchAnim = useRef(new Animated.Value(1)).current; // 1 = shown, 0 = hidden
    const lastY = useRef(0);

    useEffect(() => {
        Animated.timing(searchAnim, {
            toValue: searchVisible ? 1 : 0,
            duration: 260,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [searchVisible, searchAnim]);

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        const diff = y - lastY.current;
        if (y <= 4) {
            setSearchVisible(true);
        } else if (diff > 6 && searchVisible) {
            setSearchVisible(false);
        } else if (diff < -6 && !searchVisible) {
            setSearchVisible(true);
        }
        lastY.current = y;
    };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(timer);
    }, [search]);

    // Debounce the filter -> API call by 1s after a chip tap.
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedFilter(activeFilter), 1000);
        return () => clearTimeout(timer);
    }, [activeFilter]);

    const { data, isLoading, isError, refetch } = useCategoryProducts(
        categoryId,
        debouncedFilter,
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
                const original = Number(product.price ?? 0);
                const discounted = Number(product.final_price ?? product.price ?? 0);
                const discount = Number(product.discount ?? 0);
                return {
                    id: String(product.id || product._id),
                    name: product.title,
                    store: product.business_id?.name || 'SHOP365 Provider',
                    price: discounted,
                    originalPrice: discount > 0 ? original : undefined,
                    discount,
                    discountType: product.discount_type || 'percentage',
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
                    rightAction={
                        <Animated.View
                            pointerEvents={searchVisible ? 'none' : 'auto'}
                            style={{
                                opacity: searchAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 0],
                                }),
                                transform: [
                                    {
                                        scale: searchAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, 0.6],
                                        }),
                                    },
                                ],
                            }}
                        >
                            <Pressable
                                onPress={() => setSearchVisible(true)}
                                className="h-10 w-10 items-center justify-center rounded-full bg-white/60 active:opacity-60"
                            >
                                <Search size={20} color="#1e293b" />
                            </Pressable>
                        </Animated.View>
                    }
                />

                <Animated.View
                    style={{
                        opacity: searchAnim,
                        maxHeight: searchAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 56],
                        }),
                        transform: [
                            {
                                translateY: searchAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-12, 0],
                                }),
                            },
                        ],
                        overflow: 'hidden',
                    }}
                >
                    <SearchBar value={search} onChangeText={setSearch} />
                </Animated.View>

                <FilterChips
                    filters={filters}
                    activeFilter={activeFilter}
                    onFilterPress={setActiveFilter}
                />

                <ScrollView
                    className="flex-1 mt-4"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >
                    {/* Providers in this category — filtered on the backend */}
                    <CategoryProviders categoryId={categoryId} onProviderPress={onProviderPress} />

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
                                                    originalPrice={row[0].originalPrice}
                                                    discount={row[0].discount}
                                                    discountType={row[0].discountType}
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
                                                    originalPrice={row[1].originalPrice}
                                                    discount={row[1].discount}
                                                    discountType={row[1].discountType}
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
