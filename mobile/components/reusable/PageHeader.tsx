import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

type PageHeaderProps = {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    backIconColor?: string;
};

export function PageHeader({
    title,
    subtitle,
    onBack,
    backIconColor = '#171717',
}: PageHeaderProps) {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;

    const headerTitleSize = isTinyScreen ? 'text-lg' : isSmallScreen ? 'text-xl' : 'text-2xl';
    const subtitleSize = isTinyScreen ? 'text-xs' : isSmallScreen ? 'text-[13px]' : 'text-sm';
    const headerPaddingX = isTinyScreen ? 'px-3' : isSmallScreen ? 'px-4' : 'px-5';
    const backBtnSize = isTinyScreen ? 'h-9 w-9' : isSmallScreen ? 'h-10 w-10' : 'h-11 w-11';
    const backBtnRadius = isTinyScreen ? 'rounded-xl' : 'rounded-2xl';
    const backIconSize = isTinyScreen ? 20 : isSmallScreen ? 21 : 23;

    return (
        <View className={`flex-row items-center ${headerPaddingX} pb-2 pt-2 min-w-0`}>
            {onBack && (
                <Pressable
                    className={`${backBtnSize} ${backBtnRadius} shrink-0 items-center justify-center bg-white/60 active:opacity-60`}
                    onPress={onBack}
                >
                    <ChevronLeft size={backIconSize} color={backIconColor} />
                </Pressable>
            )}
            <View className="ml-3 flex-1 min-w-0">
                <Text
                    className={`${headerTitleSize} font-lufga-bold text-slate-950`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {title}
                </Text>
                {subtitle ? (
                    <Text
                        className={`${subtitleSize} font-lufga font-light text-slate-500 mt-0.5`}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {subtitle}
                    </Text>
                ) : null}
            </View>
        </View>
    );
}
