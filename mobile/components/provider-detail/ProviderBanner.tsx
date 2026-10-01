import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Star, BadgePercent, Zap } from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { AppColors } from '@/components/reusable/colors';

function isOpenNow(opening?: string, closing?: string): boolean | null {
    if (!opening || !closing) return null;
    const o = String(opening).split(':').map(Number);
    const c = String(closing).split(':').map(Number);
    if ([o[0], o[1], c[0], c[1]].some((n) => Number.isNaN(n))) return null;
    const openMin = o[0] * 60 + o[1];
    const closeMin = c[0] * 60 + c[1];
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return openMin <= closeMin
        ? nowMin >= openMin && nowMin < closeMin
        : nowMin >= openMin || nowMin < closeMin;
}

type ProviderBannerProps = {
    name: string;
    type?: string;
    productTypes?: string[];
    imageUri?: string;
    rating: number;
    reviewsCount: number;
    discount?: number;
    openingTime?: string;
    closingTime?: string;
    deliveryTime?: string;
    onReviewsPress?: () => void;
};

export function ProviderBanner({
    name,
    type,
    productTypes = [],
    imageUri,
    rating,
    reviewsCount,
    discount = 0,
    openingTime,
    closingTime,
    deliveryTime,
    onReviewsPress,
}: ProviderBannerProps) {
    const { width } = useWindowDimensions();
    const isSmall = width < 380;
    const avatarSize = isSmall ? 64 : 76;

    const openStatus = isOpenNow(openingTime, closingTime);
    const isOpen = openStatus === null ? true : openStatus;
    const etaRaw = String(deliveryTime ?? '').trim();
    const etaLabel = etaRaw && !/\bmin(s)?\b/i.test(etaRaw) ? `${etaRaw} min` : etaRaw;

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
                    {productTypes.length > 0 ? (
                        <View className="flex-row flex-wrap items-center gap-x-1.5 gap-y-1 mt-1">
                            {productTypes.map((pt, idx) => (
                                <View key={pt} className="flex-row items-center">
                                    <View className="rounded-full bg-amber-100/80 px-2 py-0.5">
                                        <Text
                                            className="text-[11px] font-lufga-semibold text-amber-800 capitalize"
                                            numberOfLines={1}
                                        >
                                            {pt}
                                        </Text>
                                    </View>
                                    {idx < productTypes.length - 1 && (
                                        <Text className="mx-0.5 text-[10px] text-slate-300">•</Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : type ? (
                        <Text
                            className="text-xs font-lufga text-slate-400 mt-0.5 capitalize"
                            numberOfLines={1}
                        >
                            {type}
                        </Text>
                    ) : null}

                    <View className="flex-row items-center flex-wrap gap-2 mt-2">
                        <Pressable
                            onPress={onReviewsPress}
                            disabled={!onReviewsPress}
                            className="flex-row items-center rounded-full bg-amber-50 px-2 py-1 active:opacity-70"
                        >
                            <Star size={13} color={AppColors.yellow} fill={AppColors.yellow} />
                            <Text className="ml-1 text-xs font-lufga-semibold text-slate-800">
                                {rating > 0 ? rating.toFixed(1) : 'New'}
                            </Text>
                            <Text className="ml-1 text-[11px] font-lufga text-slate-400">
                                ({reviewsCount})
                            </Text>
                        </Pressable>
                        {etaLabel ? (
                            <View className="flex-row items-center rounded-full bg-amber-50 px-2 py-1">
                                <Zap size={12} color="#b45309" fill="#f59e0b" />
                                <Text
                                    className="ml-1 text-xs font-lufga-semibold text-amber-900"
                                    numberOfLines={1}
                                >
                                    {etaLabel}
                                </Text>
                            </View>
                        ) : null}
                        <View
                            className="flex-row items-center rounded-full px-3 py-1.5"
                            style={{
                                backgroundColor: isOpen ? '#16a34a' : '#dc2626',
                                minWidth: 70,
                                justifyContent: 'center',
                            }}
                        >
                            <View
                                className="h-2 w-2 rounded-full mr-1.5"
                                style={{
                                    backgroundColor: isOpen ? '#bbf7d0' : '#fecaca',
                                }}
                            />
                            <Text
                                className="text-[11px] font-lufga-bold"
                                style={{ color: '#ffffff' }}
                                numberOfLines={1}
                            >
                                {isOpen ? 'Open' : 'Closed'}
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
