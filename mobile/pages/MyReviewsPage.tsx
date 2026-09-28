import {
    ActivityIndicator,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bike, ChevronRight, Star, Store } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { PageHeader } from '@/components/reusable/PageHeader';
import { GlassCard } from '@/components/reusable/GlassCard';
import { useMyReviews } from '@/api/reviews/useMyReviews';
import { API_BASE_URL } from '@/api/client';
import type { MyReview } from '@/api/reviews/review.service';

type Props = {
    onBack: () => void;
    /** Open the tracking page for the reviewed order. */
    onOpenOrder?: (orderId: string) => void;
};

// Resolve an image path that may be absolute or relative to the API host.
function resolveImage(path?: string): string | undefined {
    if (!path) return undefined;
    if (/^https?:\/\//.test(path)) return path;
    const normalized = path.startsWith('/') ? path : `/uploads/${path}`;
    return `${API_BASE_URL}${normalized}`;
}

function StaticStars({ value, size = 14 }: { value: number; size?: number }) {
    return (
        <View className="flex-row">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    size={size}
                    color="#EAB308"
                    fill={n <= value ? '#EAB308' : 'transparent'}
                    style={{ marginRight: 1 }}
                />
            ))}
        </View>
    );
}

function formatDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

function ReviewCard({ review, onPress }: { review: MyReview; onPress?: () => void }) {
    const { width } = useWindowDimensions();
    const isTiny = width < 340;
    const isSmall = width < 380;

    const isRider = review.type === 'rider';
    const accentBg = isRider ? 'bg-purple-100' : 'bg-amber-100';
    const accentText = isRider ? 'text-purple-700' : 'text-amber-700';
    const iconColor = isRider ? '#7c3aed' : '#b77900';
    const productImg = resolveImage(review.product_image);

    // Responsive sizes
    const pad = isTiny ? 'p-3' : 'p-4';
    const padX = isTiny ? 'px-3' : 'px-4';
    const avatarBox = isTiny ? 'h-10 w-10' : 'h-12 w-12';
    const avatarIcon = isTiny ? 17 : 20;
    const nameSize = isTiny ? 'text-[13px]' : isSmall ? 'text-[14px]' : 'text-[15px]';
    const commentSize = isTiny ? 'text-[13px]' : 'text-sm';
    const starSize = isTiny ? 14 : 16;
    const thumb = isTiny ? 'h-12 w-12' : isSmall ? 'h-14 w-14' : 'h-16 w-16';

    return (
        <Pressable onPress={onPress} className="active:opacity-90">
            <GlassCard className="mb-3 overflow-hidden p-0">
                {/* Header row */}
                <View className={`flex-row items-center ${pad} pb-3`}>
                    <View
                        className={`${avatarBox} shrink-0 items-center justify-center overflow-hidden rounded-2xl ${review.target_image ? 'bg-slate-100' : accentBg
                            }`}
                    >
                        {review.target_image ? (
                            <Image
                                source={{ uri: review.target_image }}
                                className={avatarBox}
                                resizeMode="cover"
                            />
                        ) : isRider ? (
                            <Bike size={avatarIcon} color={iconColor} />
                        ) : (
                            <Store size={avatarIcon} color={iconColor} />
                        )}
                    </View>

                    <View className="ml-3 flex-1 min-w-0">
                        <Text
                            className={`${nameSize} font-lufga-bold text-slate-900`}
                            numberOfLines={1}
                        >
                            {review.target_name}
                        </Text>
                        <View className="mt-1 flex-row items-center">
                            <View className={`rounded-full px-2 py-0.5 ${accentBg}`}>
                                <Text className={`text-[10px] font-lufga-semibold ${accentText}`}>
                                    {isRider ? 'Rider' : 'Order'}
                                </Text>
                            </View>
                            <View className="mx-2 h-1 w-1 rounded-full bg-slate-300" />
                            <Text className="text-[11px] font-lufga text-slate-400" numberOfLines={1}>
                                {formatDate(review.createdAt)}
                            </Text>
                        </View>
                    </View>

                    {/* Rating pill */}
                    <View className="ml-2 shrink-0 flex-row items-center rounded-full bg-white/80 px-2.5 py-1">
                        <Star size={14} color="#EAB308" fill="#EAB308" />
                        <Text className="ml-1 text-sm font-lufga-bold text-slate-900">
                            {review.rating.toFixed(1)}
                        </Text>
                    </View>
                </View>

                {/* Stars + comment + product image */}
                <View className={`flex-row ${padX}`}>
                    <View className="flex-1 pr-3">
                        <StaticStars value={review.rating} size={starSize} />
                        {review.comments ? (
                            <Text className={`mt-2 ${commentSize} leading-5 font-lufga text-slate-700`}>
                                {review.comments}
                            </Text>
                        ) : (
                            <Text className={`mt-2 ${commentSize} font-lufga italic text-slate-400`}>
                                No comment added.
                            </Text>
                        )}
                    </View>
                    {productImg ? (
                        <Image
                            source={{ uri: productImg }}
                            className={`${thumb} shrink-0 rounded-2xl bg-slate-100`}
                            resizeMode="cover"
                        />
                    ) : null}
                </View>

                {/* Vendor reply */}
                {review.reply ? (
                    <View className={`mt-3 ${isTiny ? 'mx-3' : 'mx-4'} rounded-2xl border-l-4 border-amber-300 bg-amber-50/70 p-3`}>
                        <Text className="text-[11px] font-lufga-semibold text-amber-700">
                            Reply from vendor
                        </Text>
                        <Text className={`mt-0.5 ${commentSize} leading-5 font-lufga text-slate-700`}>
                            {review.reply}
                        </Text>
                    </View>
                ) : null}

                {/* Footer */}
                <View className={`mt-3 flex-row items-center justify-between border-t border-white/60 ${padX} py-2.5`}>
                    <Text className="text-[11px] font-lufga text-slate-400" numberOfLines={1}>
                        Order #{String(review.order_id).slice(-6).toUpperCase()}
                    </Text>
                    <View className="ml-2 shrink-0 flex-row items-center">
                        <Text className="text-[11px] font-lufga-semibold text-amber-700">
                            View order
                        </Text>
                        <ChevronRight size={14} color="#b77900" />
                    </View>
                </View>
            </GlassCard>
        </Pressable>
    );
}

export function MyReviewsPage({ onBack, onOpenOrder }: Props) {
    const { data: reviews = [], isLoading, isError, refetch, isRefetching } = useMyReviews();
    const { width } = useWindowDimensions();
    const isTiny = width < 340;
    const listPx = isTiny ? 'px-3' : 'px-4';

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <PageHeader title="My Reviews" subtitle="Your ratings & feedback" onBack={onBack} />

                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#EAB308" />
                    </View>
                ) : isError ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <Text className="text-center font-lufga text-slate-500">
                            Could not load your reviews.
                        </Text>
                        <Pressable
                            onPress={() => refetch()}
                            className="mt-4 rounded-full bg-amber-50 px-6 py-3"
                        >
                            <Text className="font-lufga-semibold text-amber-700">Retry</Text>
                        </Pressable>
                    </View>
                ) : reviews.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-8">
                        <View className="h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                            <Star size={30} color="#b77900" />
                        </View>
                        <Text className="mt-4 text-base font-lufga-semibold text-slate-700">
                            No reviews yet
                        </Text>
                        <Text className="mt-1 text-center text-sm font-lufga text-slate-400">
                            Reviews you leave after a delivery will show up here.
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        className={`flex-1 ${listPx}`}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={refetch}
                                tintColor="#EAB308"
                                colors={['#EAB308']}
                            />
                        }
                    >
                        {reviews.map((review) => (
                            <ReviewCard
                                key={`${review.type}-${review._id}`}
                                review={review}
                                onPress={() => onOpenOrder?.(String(review.order_id))}
                            />
                        ))}
                    </ScrollView>
                )}
            </SafeAreaView>
        </AppBackground>
    );
}
