import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { GradientPill } from '@/components/reusable/GradientPill';

type PromoBannerProps = {
    discount?: string;
    storeName?: string;
    onTrackPress?: () => void;
};

/**
 * Responsive promotional banner for the home page.
 * The yellow campaign surface, cream CTA and dark discount badge mirror the
 * supplied reference while keeping the app's own SHOP365 styling.
 */
export function PromoBanner({
    discount = '10%',
    storeName = 'SHOP365 Mart',
    onTrackPress,
}: PromoBannerProps) {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;
    const isUltraTinyScreen = width < 320;

    const marginX = isUltraTinyScreen ? 'mx-3' : isTinyScreen ? 'mx-3.5' : 'mx-4';
    const marginTop = isUltraTinyScreen ? 'mt-3' : 'mt-4';
    const bannerHeight = isUltraTinyScreen ? 156 : isTinyScreen ? 166 : isSmallScreen ? 178 : 194;
    const contentPadding = isUltraTinyScreen ? 14 : isTinyScreen ? 16 : isSmallScreen ? 18 : 22;
    const badgeSize = isUltraTinyScreen ? 88 : isTinyScreen ? 98 : isSmallScreen ? 108 : 124;
    const titleSize = isUltraTinyScreen ? 20 : isTinyScreen ? 22 : isSmallScreen ? 24 : 27;
    const subtitleSize = isUltraTinyScreen ? 11 : isTinyScreen ? 12 : isSmallScreen ? 13 : 14;
    const discountSize = isUltraTinyScreen ? 33 : isTinyScreen ? 38 : isSmallScreen ? 42 : 48;
    const offSize = isUltraTinyScreen ? 13 : isTinyScreen ? 14 : isSmallScreen ? 15 : 17;
    const buttonWidth = isUltraTinyScreen ? 92 : isTinyScreen ? 102 : isSmallScreen ? 112 : 126;
    const buttonHeight = isUltraTinyScreen ? 36 : isTinyScreen ? 38 : 40;

    return (
        <GradientPill
            colors={['#FFE485', '#F5CB4B']}
            className={`${marginX} ${marginTop} rounded-[28px]`}
            style={{ height: bannerHeight }}
        >
            <View className="flex-1 overflow-hidden">
                {/* Fine campaign curves separating copy from the offer badge. */}
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        right: badgeSize * 0.55,
                        top: 0,
                        width: badgeSize * 1.35,
                        height: bannerHeight,
                        opacity: 0.26,
                    }}
                >
                    <Svg width="100%" height="100%" viewBox="0 0 160 220">
                        {[0, 13, 26, 39].map((offset) => (
                            <Path
                                key={offset}
                                d={`M ${92 + offset} -20 C ${28 + offset} 54, ${24 + offset} 150, ${74 + offset} 242`}
                                fill="none"
                                stroke="#E3A900"
                                strokeWidth="1.3"
                            />
                        ))}
                    </Svg>
                </View>

                {/* Left promotional copy. */}
                <View
                    style={{
                        position: 'absolute',
                        left: contentPadding,
                        top: contentPadding,
                        bottom: contentPadding,
                        width: `56%`,
                    }}
                >
                    <Text
                        style={{ fontSize: titleSize, lineHeight: titleSize * 1.12 }}
                        className="font-lufga-bold text-[#111827]"
                        numberOfLines={2}
                    >
                        {'Stock up &\nSave Big'}
                    </Text>
                    <Text
                        style={{ fontSize: subtitleSize, marginTop: isUltraTinyScreen ? 4 : 7 }}
                        className="font-lufga text-[#111827]"
                        numberOfLines={1}
                    >
                        On {storeName}
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Track your ${storeName} order`}
                        onPress={onTrackPress}
                        style={{
                            width: buttonWidth,
                            height: buttonHeight,
                            marginTop: isUltraTinyScreen ? 9 : isTinyScreen ? 11 : 14,
                        }}
                        className="items-center justify-center rounded-full border border-white bg-[#FFF8E4]/95 active:opacity-75"
                    >
                        <Text
                            style={{ fontSize: isUltraTinyScreen ? 13 : 15 }}
                            className="font-lufga-bold text-[#111827]"
                        >
                            Track
                        </Text>
                    </Pressable>
                </View>

                {/* Right circular offer badge. */}
                <View
                    style={{
                        position: 'absolute',
                        right: isUltraTinyScreen ? 11 : isTinyScreen ? 13 : 16,
                        top: (bannerHeight - badgeSize) / 2,
                        width: badgeSize,
                        height: badgeSize,
                        borderRadius: badgeSize / 2,
                        backgroundColor: '#182131',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    {/* Subtle contour pattern inside the dark badge. */}
                    <View
                        pointerEvents="none"
                        style={{ position: 'absolute', left: 0, right: 0, bottom: -4, height: badgeSize * 0.46, opacity: 0.15 }}
                    >
                        <Svg width="100%" height="100%" viewBox="0 0 120 60">
                            {[0, 8, 16, 24].map((offset) => (
                                <Path
                                    key={offset}
                                    d={`M -8 ${18 + offset} C 20 ${4 + offset}, 46 ${30 + offset}, 78 ${13 + offset} S 130 ${17 + offset}, 132 ${30 + offset}`}
                                    fill="none"
                                    stroke="#91A0B8"
                                    strokeWidth="1.3"
                                />
                            ))}
                        </Svg>
                    </View>
                    <Text
                        style={{ fontSize: discountSize, lineHeight: discountSize * 1.02 }}
                        className="font-lufga-bold text-white"
                        numberOfLines={1}
                    >
                        {discount}
                    </Text>
                    <Text
                        style={{ fontSize: offSize, marginTop: 2 }}
                        className="font-lufga-semibold text-white"
                    >
                        OFF
                    </Text>
                </View>
            </View>
        </GradientPill>
    );
}
