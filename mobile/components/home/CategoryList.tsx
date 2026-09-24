import { View, Text, ScrollView, Pressable, Image, useWindowDimensions } from 'react-native';
import { GlassCard } from '@/components/reusable/GlassCard';

type Category = {
    id: string;
    name: string;
    subtitle: string;
    image?: any;
    imageUri?: string;
};

type CategoryListProps = {
    categories: Category[];
    onCategoryPress?: (category: Category) => void;
};

export function CategoryList({ categories, onCategoryPress }: CategoryListProps) {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;
    const isUltraTinyScreen = width < 320;

    const cardWidth = isUltraTinyScreen
        ? 'w-28'
        : isTinyScreen
            ? 'w-32'
            : isSmallScreen
                ? 'w-38'
                : 'w-40';
    const cardMinHeight = isUltraTinyScreen
        ? 'min-h-[88px]'
        : isTinyScreen
            ? 'min-h-[100px]'
            : isSmallScreen
                ? 'min-h-[112px]'
                : 'min-h-30';
    const nameFontSize = isUltraTinyScreen
        ? 'text-[13px]'
        : isTinyScreen
            ? 'text-[14px]'
            : isSmallScreen
                ? 'text-[15px]'
                : 'text-[16px]';
    const subtitleFontSize = isUltraTinyScreen
        ? 'text-[10px]'
        : isTinyScreen
            ? 'text-[10px]'
            : isSmallScreen
                ? 'text-[11px]'
                : 'text-[14px]';
    const subtitleMaxLen = isUltraTinyScreen ? 10 : isTinyScreen ? 12 : isSmallScreen ? 14 : 18;
    const imageSize = isUltraTinyScreen
        ? 'w-12 h-12'
        : isTinyScreen
            ? 'w-14 h-14'
            : isSmallScreen
                ? 'w-16 h-16'
                : 'w-20 h-20';
    const paddingTop = isUltraTinyScreen
        ? 'pt-1.5 pl-1.5'
        : isTinyScreen
            ? 'pt-2 pl-2'
            : isSmallScreen
                ? 'pt-3 pl-3'
                : 'pt-4 pl-4';
    const marginRight = isUltraTinyScreen
        ? 'mr-1.5'
        : isTinyScreen
            ? 'mr-2'
            : isSmallScreen
                ? 'mr-2.5'
                : 'mr-3';
    const marginTop = isUltraTinyScreen
        ? 'mt-2'
        : isTinyScreen
            ? 'mt-2.5'
            : isSmallScreen
                ? 'mt-3'
                : 'mt-4';
    const paddingX = isUltraTinyScreen ? 'px-3' : 'px-4';

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className={marginTop}>
            <View className={`flex-row ${paddingX}`}>
                {categories.map((cat) => (
                    <Pressable
                        key={cat.id}
                        className={marginRight}
                        onPress={() => onCategoryPress?.(cat)}
                    >
                        <GlassCard
                            variant="light"
                            className={`${cardWidth} ${cardMinHeight} rounded-xl`}
                        >
                            <View className={`${paddingTop} flex-1`}>
                                <Text
                                    className={`${nameFontSize} font-lufga font-normal text-slate-900`}
                                    numberOfLines={1}
                                >
                                    {cat.name}
                                </Text>
                                <Text
                                    className={`${subtitleFontSize} text-[#6B7280] font-lufga font-light mt-0.5`}
                                >
                                    {cat.subtitle?.length > subtitleMaxLen
                                        ? `${cat.subtitle.slice(0, subtitleMaxLen)}...`
                                        : cat.subtitle}
                                </Text>
                                <View className="flex-1 items-end justify-end pr-1 pb-1">
                                    <Image
                                        source={cat.imageUri ? { uri: cat.imageUri } : cat.image}
                                        className={imageSize}
                                        resizeMode="contain"
                                    />
                                </View>
                            </View>
                        </GlassCard>
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}
