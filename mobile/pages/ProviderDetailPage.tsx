import { useMemo, useState, useCallback, useRef } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageSquare, ShoppingBag } from 'lucide-react-native';
import { PageHeader } from '@/components/reusable/PageHeader';
import { AppBackground } from '@/components/AppBackground';
import { AppColors } from '@/components/reusable/colors';
import { FilterChips } from '@/components/category/FilterChips';
import { API_BASE_URL } from '@/api/client';
import { useProviderDetail, useProviderReviews } from '@/api/provider/useProviderDetail';
import { ProviderBanner } from '@/components/provider-detail/ProviderBanner';
import { ProviderInfoCard } from '@/components/provider-detail/ProviderInfoCard';
import {
    ProviderProductGrid,
    type GridProduct,
} from '@/components/provider-detail/ProviderProductGrid';
import { ProviderReviews } from '@/components/provider-detail/ProviderReviews';

function imageUri(path?: string) {
    if (!path) return undefined;
    if (/^https?:\/\//.test(path)) return path;
    const normalized = path.startsWith('/') ? path : `/uploads/${path}`;
    return `${API_BASE_URL}${normalized}`;
}

function businessImageUri(path?: string) {
    if (!path) return undefined;
    if (/^https?:\/\//.test(path)) return path;
    return `${API_BASE_URL}/storage/${path}`;
}

type ProviderDetailPageProps = {
    businessId: string;
    initialName?: string;
    onBack?: () => void;
    onProductPress?: (product: GridProduct) => void;
};

export function ProviderDetailPage({
    businessId,
    initialName = 'Provider',
    onBack,
    onProductPress,
}: ProviderDetailPageProps) {
    const { width } = useWindowDimensions();
    const isTiny = width < 340;
    const isSmall = width < 380;

    const [activeFilter, setActiveFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);
    const [reviewsOnly, setReviewsOnly] = useState(false);
    const scrollRef = useRef<ScrollView | null>(null);

    const { data: provider, isLoading, isError, refetch } = useProviderDetail(businessId);
    const {
        data: reviews = [],
        isLoading: reviewsLoading,
        refetch: refetchReviews,
    } = useProviderReviews(businessId);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([refetch(), refetchReviews()]);
        } finally {
            setRefreshing(false);
        }
    }, [refetch, refetchReviews]);

    const allProducts = useMemo<GridProduct[]>(
        () =>
            (provider?.products || []).map((p) => {
                const uri = imageUri(p.image_url || p.image);
                const original = Number(p.price ?? 0);
                const discounted = Number(p.final_price ?? p.price ?? 0);
                const discount = Number(p.discount ?? 0);
                return {
                    id: String(p.id || p._id),
                    name: p.title,
                    store: provider?.name || 'SHOP365 Provider',
                    price: discounted,
                    originalPrice: discount > 0 ? original : undefined,
                    discount,
                    discountType: p.discount_type || 'percentage',
                    tag: p.type,
                    imageUri: uri,
                    image: uri ? { uri } : undefined,
                };
            }),
        [provider]
    );

    const filters = useMemo(() => {
        const unique = new Set<string>();
        allProducts.forEach((p) => {
            if (p.tag && p.tag.trim()) unique.add(p.tag.trim());
        });
        return ['All', ...Array.from(unique).filter((t) => t !== 'All')];
    }, [allProducts]);

    const products = useMemo<GridProduct[]>(() => {
        if (activeFilter === 'All') return allProducts;
        return allProducts.filter((p) => p.tag === activeFilter);
    }, [allProducts, activeFilter]);

    const enterReviewsOnly = () => setReviewsOnly(true);
    const exitReviewsOnly = () => setReviewsOnly(false);

    const sectionTitleSize = isTiny ? 'text-base' : 'text-lg';
    const sectionPaddingX = isTiny ? 'px-4' : 'px-5';
    const sectionIcon = isTiny ? 'h-9 w-9' : 'h-10 w-10';
    const backBtn = isTiny
        ? 'h-9 w-9 rounded-xl'
        : isSmall
          ? 'h-10 w-10 rounded-2xl'
          : 'h-11 w-11 rounded-2xl';

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {reviewsOnly ? (
                    <>
                        {/* Reviews-only mode header */}
                        <View className={`px-5 pt-2 pb-3 flex-row items-center justify-between`}>
                            <Pressable
                                onPress={onBack}
                                className={`${backBtn} mr-3 items-center justify-center shrink-0 bg-white/70 active:opacity-60`}
                            >
                                <ArrowLeft size={isTiny ? 18 : 20} color="#1e293b" />
                            </Pressable>
                            <View className="flex-1 min-w-0">
                                <Text
                                    className={`${isTiny ? 'text-lg' : 'text-xl'} font-lufga-bold text-slate-900`}
                                    numberOfLines={1}
                                >
                                    {provider?.name || initialName}
                                </Text>
                                <Text className="text-xs font-lufga text-slate-400 mt-0.5">
                                    Customer Reviews
                                </Text>
                            </View>
                            <Pressable
                                onPress={exitReviewsOnly}
                                className={`${backBtn} ml-3 items-center justify-center shrink-0 bg-amber-100 active:opacity-70 flex-row`}
                            >
                                <ShoppingBag size={isTiny ? 15 : 17} color="#b77900" />
                                {!isTiny && (
                                    <Text className="ml-1.5 text-xs font-lufga-bold text-amber-800">
                                        Products
                                    </Text>
                                )}
                            </Pressable>
                        </View>

                        <ScrollView
                            className="flex-1"
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    tintColor={AppColors.yellow}
                                    colors={[AppColors.yellow]}
                                />
                            }
                        >
                            {/* Reviews Summary Card */}
                            <View className={`${sectionPaddingX} mb-4`}>
                                <View className="rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100/60 p-5 border border-amber-100">
                                    <View className="flex-row items-end justify-between mb-3">
                                        <Text className="text-5xl font-lufga-bold text-amber-700">
                                            {(provider?.reviews_avg_rating || 0).toFixed(1)}
                                        </Text>
                                        <View className="items-end">
                                            <Text className="text-sm font-lufga-bold text-amber-800">
                                                {provider?.reviews_count || 0} reviews
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row">
                                        {[1, 2, 3, 4, 5].map((n) => {
                                            const filled =
                                                n <= Math.round(provider?.reviews_avg_rating || 0);
                                            return (
                                                <View key={n} className="mr-1">
                                                    <View className="text-amber-500">
                                                        <Text
                                                            style={{
                                                                fontSize: isTiny ? 20 : 24,
                                                                color: filled
                                                                    ? AppColors.yellow
                                                                    : 'transparent',
                                                                textShadowColor: filled
                                                                    ? 'transparent'
                                                                    : AppColors.yellow,
                                                                textShadowOffset: {
                                                                    width: 0,
                                                                    height: 0,
                                                                },
                                                                textShadowRadius: 0,
                                                            }}
                                                        >
                                                            ★
                                                        </Text>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>

                            {/* Reviews Only Section Header */}
                            <View className={`${sectionPaddingX} mb-3 flex-row items-center`}>
                                <View
                                    className={`${sectionIcon} mr-3 items-center justify-center rounded-xl bg-amber-50 shrink-0`}
                                >
                                    <MessageSquare
                                        size={isTiny ? 16 : 18}
                                        color={AppColors.yellow}
                                        fill={AppColors.yellow}
                                    />
                                </View>
                                <View className="flex-1 min-w-0">
                                    <Text
                                        className={`${sectionTitleSize} font-lufga-bold text-slate-900`}
                                        numberOfLines={1}
                                    >
                                        All Reviews
                                    </Text>
                                    <Text className="text-xs font-lufga text-slate-400 mt-0.5">
                                        {provider?.reviews_count || 0}{' '}
                                        {(provider?.reviews_count || 0) === 1
                                            ? 'review'
                                            : 'reviews'}
                                    </Text>
                                </View>
                            </View>

                            <ProviderReviews reviews={reviews} loading={reviewsLoading} />
                            <View className="h-8" />
                        </ScrollView>
                    </>
                ) : (
                    <>
                        {/* Normal combined view */}
                        <PageHeader
                            title={provider?.name || initialName}
                            subtitle={provider?.type ? provider.type : 'Provider'}
                            onBack={onBack}
                            backIconColor="#1e293b"
                        />

                        {isLoading ? (
                            <View className="items-center py-16">
                                <ActivityIndicator size="large" color={AppColors.yellow} />
                            </View>
                        ) : isError || !provider ? (
                            <View className="items-center px-5 py-16">
                                <Text
                                    className="font-lufga text-center text-red-600"
                                    onPress={() => refetch()}
                                >
                                    Failed to load provider. Tap to try again.
                                </Text>
                            </View>
                        ) : (
                            <ScrollView
                                ref={scrollRef}
                                className="flex-1"
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={handleRefresh}
                                        tintColor={AppColors.yellow}
                                        colors={[AppColors.yellow]}
                                    />
                                }
                            >
                                <ProviderBanner
                                    name={provider.name}
                                    type={provider.type}
                                    productTypes={filters.filter((f) => f !== 'All')}
                                    imageUri={businessImageUri(provider.image)}
                                    rating={provider.reviews_avg_rating || 0}
                                    reviewsCount={provider.reviews_count || 0}
                                    discount={provider.discount || 0}
                                    openingTime={provider.opening_time}
                                    closingTime={provider.closing_time}
                                    deliveryTime={provider.delivery_time}
                                    onReviewsPress={enterReviewsOnly}
                                />

                                <ProviderInfoCard
                                    deliveryFee={provider.delivery_fee}
                                    minimumOrder={provider.minimum_order}
                                    openingTime={provider.opening_time}
                                    closingTime={provider.closing_time}
                                />

                                {/* Product Type FilterChips */}
                                {filters.length > 1 && (
                                    <View className="mb-5">
                                        <FilterChips
                                            filters={filters}
                                            activeFilter={activeFilter}
                                            onFilterPress={setActiveFilter}
                                        />
                                    </View>
                                )}

                                {products.length === 0 ? (
                                    <View className="items-center px-5 py-10 mt-2">
                                        <Text className="text-sm font-lufga text-center text-slate-500">
                                            No products in "{activeFilter}" category.
                                        </Text>
                                    </View>
                                ) : (
                                    <View className="mt-2">
                                        <ProviderProductGrid
                                            products={products}
                                            onProductPress={onProductPress}
                                        />
                                    </View>
                                )}

                                <View className="h-8" />
                            </ScrollView>
                        )}
                    </>
                )}
            </SafeAreaView>
        </AppBackground>
    );
}
