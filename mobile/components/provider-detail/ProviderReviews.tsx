import { Text, View } from 'react-native';
import { Star, MessageSquare } from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { AppColors } from '@/components/reusable/colors';
import type { ProviderReview } from '@/api/provider/providerDetail.service';

function Stars({ value }: { value: number }) {
    return (
        <View className="flex-row">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    size={13}
                    color={AppColors.yellow}
                    fill={n <= value ? AppColors.yellow : 'transparent'}
                />
            ))}
        </View>
    );
}

function timeLabel(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-PK', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

type ProviderReviewsProps = {
    reviews: ProviderReview[];
    loading?: boolean;
};

export function ProviderReviews({ reviews, loading }: ProviderReviewsProps) {
    if (!loading && reviews.length === 0) {
        return (
            <View className="items-center px-5 py-8">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-amber-50 mb-3">
                    <MessageSquare size={26} color={AppColors.yellow} />
                </View>
                <Text className="text-sm font-lufga text-slate-500 text-center">
                    No reviews yet. Be the first to review after ordering.
                </Text>
            </View>
        );
    }

    return (
        <View className="px-5">
            {reviews.map((r) => (
                <GlassCard key={r._id} variant="light" className="rounded-2xl mb-3">
                    <View className="p-4">
                        <View className="flex-row items-center justify-between mb-1.5">
                            <Text className="text-sm font-lufga-semibold text-slate-900" numberOfLines={1}>
                                {r.user_id?.name || 'Customer'}
                            </Text>
                            <Text className="text-[11px] font-lufga text-slate-400">
                                {timeLabel(r.createdAt)}
                            </Text>
                        </View>
                        <Stars value={r.rating} />
                        {r.comments ? (
                            <Text className="text-sm font-lufga text-slate-600 mt-2 leading-5">
                                {r.comments}
                            </Text>
                        ) : null}
                        {r.reply ? (
                            <View className="mt-3 rounded-xl bg-amber-50/70 p-3">
                                <Text className="text-[11px] font-lufga-semibold text-amber-700 mb-0.5">
                                    Provider replied
                                </Text>
                                <Text className="text-xs font-lufga text-slate-600 leading-5">
                                    {r.reply}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </GlassCard>
            ))}
        </View>
    );
}
