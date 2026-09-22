import { View, Text, useWindowDimensions } from 'react-native';
import { GradientPill } from '@/components/reusable/GradientPill';

type PromoBannerProps = {
    discount?: string;
    storeName?: string;
};

export function PromoBanner({ discount = '10%', storeName = 'SHOP365 Mart' }: PromoBannerProps) {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;
    const isUltraTinyScreen = width < 320;

    const padding = isUltraTinyScreen ? 'p-3' : isTinyScreen ? 'p-3.5' : isSmallScreen ? 'p-4' : 'p-6';
    const uptoSize = isUltraTinyScreen ? 'text-base' : isTinyScreen ? 'text-[15px]' : isSmallScreen ? 'text-lg' : 'text-2xl';
    const discountSize = isUltraTinyScreen ? 'text-2xl' : isTinyScreen ? 'text-[26px]' : isSmallScreen ? 'text-3xl' : 'text-5xl';
    const storeSize = isUltraTinyScreen ? 'text-[11px]' : isTinyScreen ? 'text-xs' : isSmallScreen ? 'text-sm' : 'text-base';
    const marginX = isUltraTinyScreen ? 'mx-3' : isTinyScreen ? 'mx-3.5' : 'mx-4';
    const marginTop = isUltraTinyScreen ? 'mt-3' : 'mt-4';

    return (
        <GradientPill className={`${marginX} ${marginTop} rounded-3xl`}>
            <View className={`text-app-dark ${padding}`}>
                <Text className={`text-app-dark font-medium tracking-wide ${uptoSize}`}>
                    UPTO
                </Text>
                <Text className={`text-app-dark font-medium mt-1 ${discountSize}`}>
                    {discount} OFF
                </Text>
                <Text className={`text-app-dark font-light font-lufga mt-1 ${storeSize}`}>
                    On {storeName}
                </Text>
            </View>
        </GradientPill>
    );
}
