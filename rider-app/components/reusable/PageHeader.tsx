import { Pressable, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

type PageHeaderProps = {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    right?: React.ReactNode;
};

/** Shared page header, matching the customer app's PageHeader. */
export function PageHeader({ title, subtitle, onBack, right }: PageHeaderProps) {
    return (
        <View className="flex-row items-center px-5 pb-2 pt-2">
            {onBack ? (
                <Pressable
                    onPress={onBack}
                    className="h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/60 active:opacity-60"
                >
                    <ChevronLeft size={23} color="#171717" />
                </Pressable>
            ) : null}
            <View className="ml-3 flex-1 min-w-0">
                <Text className="text-2xl font-bold text-slate-950" numberOfLines={1}>
                    {title}
                </Text>
                {subtitle ? (
                    <Text className="mt-0.5 text-sm font-light text-slate-500" numberOfLines={1}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>
            {right ? <View className="ml-2 shrink-0">{right}</View> : null}
        </View>
    );
}
