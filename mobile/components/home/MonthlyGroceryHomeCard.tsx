import { Pressable, Text, View } from 'react-native';
import { ChevronRight, PackageOpen } from 'lucide-react-native';

type MonthlyGroceryHomeCardProps = {
    onPress?: () => void;
};

export function MonthlyGroceryHomeCard({ onPress }: MonthlyGroceryHomeCardProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Monthly Grocery List"
            className="mx-5 mt-5 flex-row items-center rounded-[28px] border border-amber-200 bg-[#FFF0B8] p-4 active:opacity-85"
            onPress={onPress}
        >
            <View className="h-20 w-20 items-center justify-center rounded-[24px] bg-[#171717]">
                <PackageOpen size={34} color="#FFC400" strokeWidth={2.2} />
            </View>

            <View className="ml-4 flex-1">
                <Text className="text-xl font-lufga-bold text-slate-900" numberOfLines={1}>
                    Monthly Grocery Package
                </Text>
                <Text className="mt-1 text-sm font-lufga text-amber-800" numberOfLines={2}>
                    Build your list once, shop smarter every time
                </Text>
            </View>

            <View className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-white/50">
                <ChevronRight size={25} color="#171717" strokeWidth={2.8} />
            </View>
        </Pressable>
    );
}