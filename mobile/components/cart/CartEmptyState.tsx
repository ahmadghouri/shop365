import { Text, View } from 'react-native';

/** Shown when the cart has no items. */
export function CartEmptyState() {
    return (
        <View className="items-center justify-center px-5 pt-20">
            <Text className="text-5xl">🛒</Text>
            <Text className="mt-4 text-lg font-lufga-semibold text-slate-700">
                Your cart is empty
            </Text>
            <Text className="mt-1 text-center text-sm font-lufga text-slate-400">
                Add Grocery products, then save them to your monthly card here.
            </Text>
        </View>
    );
}
