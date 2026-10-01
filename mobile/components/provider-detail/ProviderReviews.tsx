import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ChevronDown, ChevronUp, MessageSquare, Star, User } from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { AppColors } from '@/components/reusable/colors';
import type { ProviderReview } from '@/api/provider/providerDetail.service';

type StarsProps = { value: number; size?: number };

function Stars({ value, size = 13 }: StarsProps) {
    return (
        <View className="flex-row">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    size={size}
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

const avatarColors = [
    'bg-rose-100 text-rose-700',
    'bg-sky-100 text-sky-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-pink-100 text-pink-700',
];

function pickColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
}

type ProviderReviewsProps = {
    reviews: ProviderReview[];
    loading?: boolean;
};

export function ProviderReviews({ reviews, loading }: ProviderReviewsProps) {
    const { width } = useWindowDimensions();
    const isTiny = width < 340;
    const isSmall = width < 380;

    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const avatarSize = isTiny ? 'h-9 w-9' : isSmall ? 'h-10 w-10' : 'h-11 w-11';
    const avatarFont = isTiny ? 'text-xs' : 'text-sm';
    const nameSize = isTiny ? 'text-[13px]' : 'text-sm';
    const starSize = isTiny ? 11 : 13;

    const toggleExpand = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

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
            {reviews.map((r) => {
                const name = r.user_id?.name || 'Customer';
                const colorClass = pickColor(name);
                const [bgClass, textClass] = colorClass.split(' ');
                const initials = name.trim()[0]?.toUpperCase() || 'C';
                const isExpanded = expanded[r._id] || false;
                const hasLongComment = r.comments && r.comments.length > 120;
                const hasReply = !!r.reply;
                const isExpandable = hasLongComment || hasReply;

                return (
                    <Pressable
                        key={r._id}
                        onPress={() => isExpandable && toggleExpand(r._id)}
                        className="mb-3 active:opacity-80"
                    >
                        <GlassCard
                            variant="light"
                            className={`rounded-2xl ${isExpanded && isExpandable ? 'border-2 border-[#FCD34D]' : ''}`}
                        >
                            <View className="p-4">
                                {/* Header: Profile + Name + Date */}
                                <View className="flex-row items-start mb-2">
                                    <View
                                        className={`${avatarSize} mr-3 rounded-xl ${bgClass} items-center justify-center shrink-0`}
                                    >
                                        <Text
                                            className={`${avatarFont} font-lufga-bold ${textClass}`}
                                        >
                                            {initials}
                                        </Text>
                                    </View>
                                    <View className="flex-1 min-w-0">
                                        <View className="flex-row items-center justify-between">
                                            <Text
                                                className={`${nameSize} font-lufga-semibold text-slate-900`}
                                                numberOfLines={1}
                                            >
                                                {name}
                                            </Text>
                                            <Text className="text-[11px] font-lufga text-slate-400 shrink-0 ml-2">
                                                {timeLabel(r.createdAt)}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center justify-between mt-1">
                                            <Stars value={r.rating} size={starSize} />
                                            {isExpandable && (
                                                <View className="h-5 w-5 items-center justify-center">
                                                    {isExpanded ? (
                                                        <ChevronUp size={16} color="#94a3b8" />
                                                    ) : (
                                                        <ChevronDown size={16} color="#94a3b8" />
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                {/* Rating number pill */}
                                <View className="flex-row items-center mb-2 ml-[52px]">
                                    <View className="rounded-full bg-amber-50 px-2 py-0.5 flex-row items-center">
                                        <Star
                                            size={11}
                                            color={AppColors.yellow}
                                            fill={AppColors.yellow}
                                        />
                                        <Text className="ml-1 text-[11px] font-lufga-bold text-amber-700">
                                            {r.rating}.0
                                        </Text>
                                    </View>
                                </View>

                                {/* Comments */}
                                {r.comments ? (
                                    <Text
                                        className={`${isTiny ? 'text-[12px]' : 'text-sm'} font-lufga text-slate-600 ml-[52px] leading-5`}
                                        numberOfLines={!isExpandable || isExpanded ? undefined : 3}
                                        ellipsizeMode={
                                            !isExpandable || isExpanded ? undefined : 'tail'
                                        }
                                    >
                                        {r.comments}
                                    </Text>
                                ) : null}

                                {/* Expand hint */}
                                {isExpandable && !isExpanded && hasLongComment && (
                                    <Text className="ml-[52px] mt-1 text-[11px] font-lufga-semibold text-amber-700">
                                        Tap to read more
                                    </Text>
                                )}

                                {/* Provider Reply */}
                                {(isExpanded || !isExpandable) && hasReply && (
                                    <View className="mt-3 ml-[52px] rounded-xl bg-amber-50/70 p-3">
                                        <Text className="text-[11px] font-lufga-semibold text-amber-700 mb-0.5">
                                            Provider replied
                                        </Text>
                                        <Text className="text-xs font-lufga text-slate-600 leading-5">
                                            {r.reply}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </GlassCard>
                    </Pressable>
                );
            })}
        </View>
    );
}
