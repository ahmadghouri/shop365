import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { LocateFixed, Plus } from 'lucide-react-native';

type UseLiveLocationButtonProps = {
    loading?: boolean;
    disabled?: boolean;
    onPress: () => void;
};

/** Dashed "Use Live Location" button shown when permission is granted and no live address is saved. */
export function UseLiveLocationButton({ loading, disabled, onPress }: UseLiveLocationButtonProps) {
    return (
        <Pressable
            className="flex-row items-center px-4 py-3 mb-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50/40 active:opacity-70"
            disabled={disabled}
            onPress={onPress}
        >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-100 mr-3">
                {loading ? (
                    <ActivityIndicator size="small" color="#b77900" />
                ) : (
                    <LocateFixed size={18} color="#b77900" />
                )}
            </View>
            <Text className="flex-1 text-sm font-lufga-semibold text-amber-800">
                Use Live Location
            </Text>
            <Plus size={16} color="#b77900" />
        </Pressable>
    );
}
