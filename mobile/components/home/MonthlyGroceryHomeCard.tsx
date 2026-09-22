import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ChevronRight, PackageOpen } from 'lucide-react-native';

type MonthlyGroceryHomeCardProps = {
    onPress?: () => void;
};

export function MonthlyGroceryHomeCard({ onPress }: MonthlyGroceryHomeCardProps) {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;
    const isUltraTinyScreen = width < 320;

    const outerPadding = isUltraTinyScreen ? 'p-2' : isTinyScreen ? 'p-2.5' : isSmallScreen ? 'p-3' : 'p-4';
    const outerMarginX = isUltraTinyScreen ? 'mx-3' : isSmallScreen ? 'mx-4' : 'mx-5';
    const outerMarginTop = isUltraTinyScreen ? 'mt-3' : isSmallScreen ? 'mt-4' : 'mt-5';
    const outerRadius = isUltraTinyScreen ? 'rounded-[20px]' : isSmallScreen ? 'rounded-[24px]' : 'rounded-[28px]';
    const iconContainer = isUltraTinyScreen ? 'h-12 w-12' : isTinyScreen ? 'h-14 w-14' : isSmallScreen ? 'h-16 w-16' : 'h-20 w-20';
    const iconRadius = isUltraTinyScreen ? 'rounded-[16px]' : isTinyScreen ? 'rounded-[18px]' : isSmallScreen ? 'rounded-[20px]' : 'rounded-[24px]';
    const packageIconSize = isUltraTinyScreen ? 22 : isTinyScreen ? 24 : isSmallScreen ? 28 : 34;
    const textMarginLeft = isUltraTinyScreen ? 'ml-2' : isTinyScreen ? 'ml-2.5' : isSmallScreen ? 'ml-3' : 'ml-4';
    const titleSize = isUltraTinyScreen ? 'text-[14px]' : isTinyScreen ? 'text-[15px]' : isSmallScreen ? 'text-[17px]' : 'text-xl';
    const subtitleSize = isUltraTinyScreen ? 'text-[10px]' : isTinyScreen ? 'text-[11px]' : isSmallScreen ? 'text-xs' : 'text-sm';
    const chevronContainer = isUltraTinyScreen ? 'h-7 w-7' : isTinyScreen ? 'h-8 w-8' : isSmallScreen ? 'h-9 w-9' : 'h-10 w-10';
    const chevronSize = isUltraTinyScreen ? 18 : isTinyScreen ? 20 : isSmallScreen ? 22 : 25;
    const chevronMarginLeft = isUltraTinyScreen ? 'ml-0.5' : isTinyScreen ? 'ml-1' : 'ml-2';

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Monthly Grocery List"
            className={`${outerMarginX} ${outerMarginTop} flex-row items-center ${outerRadius} border border-amber-200 bg-[#FFF0B8] ${outerPadding} active:opacity-85`}
            onPress={onPress}
        >
            <View
                className={`${iconContainer} items-center justify-center ${iconRadius} bg-[#171717]`}
            >
                <PackageOpen size={packageIconSize} color="#FFC400" strokeWidth={2.2} />
            </View>

            <View className={`${textMarginLeft} flex-1`}>
                <Text className={`${titleSize} font-lufga-bold text-slate-900`} numberOfLines={1}>
                    Monthly Grocery Package
                </Text>
                <Text
                    className={`mt-1 ${subtitleSize} font-lufga text-amber-800`}
                    numberOfLines={2}
                >
                    Build your list once, shop smarter every time
                </Text>
            </View>

            <View
                className={`${chevronMarginLeft} ${chevronContainer} items-center justify-center rounded-full bg-white/50`}
            >
                <ChevronRight size={chevronSize} color="#171717" strokeWidth={2.8} />
            </View>
        </Pressable>
    );
}
