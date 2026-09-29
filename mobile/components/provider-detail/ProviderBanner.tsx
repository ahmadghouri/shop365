import { Image, Text, View, useWindowDimensions } from 'react-native';
import { Star, BadgePercent } from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { AppColors } from '@/components/reusable/colors';

type ProviderBannerProps = {
    name: string;
    type?: string;
    imageUri?: string;
    rating: number;
    reviewsCount: number;
    discount?: number;
};

export function ProviderBanner({
    name,
    type,
    imageUri,
    rating,
    reviewsCount,
    discount = 0,
}: ProviderBannerProps) {
    const { width } = useWindowDimensions();
    const isSmall = width < 380;
    const avatarSize = isSmall ? 64 : 76;

    return (
        <GlassCard variant="light" className="mx-5 rounded-3xl">
            <View className={`flex-row items-center ${isSmall ? 'p-3' : 'p-4'}`}>
                <View
                    className="overflow-hidden rounded-2xl bg-amber-50 items-center justify-center"
                    style={{ width: avatarSize, height: avatarSize }}
                >
                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri }}
                            style={{ width: avatarSize, height: avatarSize }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text className="text-2xl font-lufga-bold text-amber-700">
                            {name?.[0]?.toUpperCase() || 'S'}
                        </Text>
                    )}
                </View>

                <View className="flex-1 ml-3 min-w-0">
                    <Text
                        className={`font-lufga-bold text-slate-900 ${isSmall ? 'text-lg' : 'text-xl'}`}
                        numberOfLines={1}
                    >
                        {name}
                    </Text>
                    {type ? (
                        <Text className="text-xs font-lufga text-slate-400 mt-0.5 capitalize" numberOfLines={1}>
                            {type}
                        </Text>
                    ) : null}

                    <View className="flex-row items-center flex-wrap gap-2 mt-2">
                        <View className="flex-row items-center rounded-full bg-amber-50 px-2 py-1">
                            <Star size={13} color={AppColors.yellow} fill={AppColors.yellow} />
                            <Text className="ml-1 text-xs font-lufga-semibold text-slate-800">
                                {rating > 0 ? rating.toFixed(1) : 'New'}
                            </Text>
                            <Text className="ml-1 text-[11px] font-lufga text-slate-400">
                                ({reviewsCount})
                            </Text>
                        </View>
                        {discount > 0 && (
                            <View className="flex-row items-center rounded-full bg-emerald-50 px-2 py-1">
                                <BadgePercent size={13} color="#15803d" />
                                <Text className="ml-1 text-xs font-lufga-semibold text-emerald-700">
                                    {discount}% OFF
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </GlassCard>
    );
}
