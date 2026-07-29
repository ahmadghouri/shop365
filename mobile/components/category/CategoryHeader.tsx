import { View, Text, Pressable } from 'react-native';
import { ShoppingCart, ChevronLeft } from 'lucide-react-native';

type CategoryHeaderProps = {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    onCartPress?: () => void;
};

export function CategoryHeader({ title, subtitle, onBack, onCartPress }: CategoryHeaderProps) {
    return (
        <View className="px-5 pt-2 pb-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
                {onBack && (
                    <Pressable className="mr-2 -ml-1 active:opacity-60" onPress={onBack}>
                        <ChevronLeft size={26} color="#1e293b" />
                    </Pressable>
                )}
                <View>
                    <Text className="text-2xl font-lufga-bold text-slate-900">{title}</Text>
                    {subtitle && (
                        <Text className="text-sm font-lufga font-light text-slate-500 mt-0.5">
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>

            <Pressable
                className="w-11 h-11 rounded-full bg-white/80 items-center justify-center active:opacity-70"
                onPress={onCartPress}
            >
                <ShoppingCart size={20} color="#1e293b" />
            </Pressable>
        </View>
    );
}
