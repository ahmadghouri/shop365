import { Pressable, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

type Props = {
    itemCount: number;
    onBack?: () => void;
};

/** Cart page top bar: back button + "My Cart" + item count. */
export function CartHeader({ itemCount, onBack }: Props) {
    return (
        <View className="flex-row items-center px-5 pb-3 pt-2">
            {onBack && (
                <Pressable
                    className="-ml-1 mr-2 h-10 w-10 items-center justify-center rounded-full bg-white/70 active:opacity-60"
                    onPress={onBack}
                >
                    <ChevronLeft size={24} color="#1e293b" />
                </Pressable>
            )}
            <View className="flex-1">
                <Text className="text-2xl font-lufga-bold text-slate-900">My Cart</Text>
                <Text className="text-xs font-lufga text-slate-500">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} ready
                </Text>
            </View>
        </View>
    );
}
