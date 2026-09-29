import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '@/components/reusable/PageHeader';
import { AppBackground } from '@/components/AppBackground';
import { AppColors } from '@/components/reusable/colors';
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

// Business/provider images are served from /storage (same as the home page).
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
    const [tab, setTab] = useState<'products' | 'reviews'>('products');
    const { data: provider, isLoading, isError, refetch } = useProviderDetail(businessId);
    const { data: reviews = [], isLoading: reviewsLoading } = useProviderReviews(businessId);

    const products = useMemo<GridProduct[]>(
        () =>
            (provider?.products || []).map((p) => {
                const uri = imageUri(p.image_url || p.image);
                return {
                    id: String(p.id || p._id),
                    name: p.title,
                    store: provider?.name || 'SHOP365 Provider',
                    price: Number(p.final_price ?? p.price ?? 0),
                    imageUri: uri,
                    image: uri ? { uri } : undefined,
                };
            }),
        [provider]
    );

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
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
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        <ProviderBanner
                            name={provider.name}
                            type={provider.type}
                            imageUri={businessImageUri(provider.image)}
                            rating={provider.reviews_avg_rating || 0}
                            reviewsCount={provider.reviews_count || 0}
                            discount={provider.discount || 0}
                        />

                        <ProviderInfoCard
                            deliveryFee={provider.delivery_fee}
                            minimumOrder={provider.minimum_order}
                            openingTime={provider.opening_time}
                            closingTime={provider.closing_time}
                        />

                        {/* Tabs */}
                        <View className="flex-row mx-5 mt-4 mb-3 rounded-full bg-white/60 p-1">
                            {(['products', 'reviews'] as const).map((t) => {
                                const active = tab === t;
                                return (
                                    <Pressable
                                        key={t}
                                        onPress={() => setTab(t)}
                                        className={`flex-1 items-center py-2 rounded-full ${active ? 'bg-app-yellow' : ''
                                            }`}
                                    >
                                        <Text
                                            className={`text-sm font-lufga-semibold ${active ? 'text-slate-900' : 'text-slate-500'
                                                }`}
                                        >
                                            {t === 'products'
                                                ? `Products (${products.length})`
                                                : `Reviews (${provider.reviews_count || 0})`}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {tab === 'products' ? (
                            <ProviderProductGrid products={products} onProductPress={onProductPress} />
                        ) : (
                            <ProviderReviews reviews={reviews} loading={reviewsLoading} />
                        )}

                        <View className="h-8" />
                    </ScrollView>
                )}
            </SafeAreaView>
        </AppBackground>
    );
}
