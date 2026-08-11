import { Image, Pressable, Text, View } from 'react-native';
import { ListPlus, Minus, Plus, Trash2 } from 'lucide-react-native';

type Extra = {
    id: string;
    name: string;
    price: number;
};

type Variant = {
    id?: string;
    name: string;
    price: number;
};

export type CartItemType = {
    id: string;
    productId: string;
    name: string;
    store: string;
    price: number;
    quantity: number;
    image?: any;
    imageUri?: string;
    extras: Extra[];
    variant?: Variant;
    providerType?: string;
};

type CartItemProps = {
    item: CartItemType;
    selectedCardId?: string;
    isAdding?: boolean;
    onRemove: (id: string) => void;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onAddToMonthly?: (productId: string, quantity: number) => void;
};

export function CartItem({
    item,
    selectedCardId,
    isAdding = false,
    onRemove,
    onUpdateQuantity,
    onAddToMonthly,
}: CartItemProps) {
    const source = item.imageUri ? { uri: item.imageUri } : item.image;
    const extrasTotal = item.extras.reduce((sum, extra) => sum + extra.price, 0);
    const itemTotal = (item.price + extrasTotal) * item.quantity;
    const isGroceryProvider = item.providerType?.trim().toLowerCase() === 'grocery';

    return (
        <View className="rounded-3xl bg-white/85 p-3">
            {/* Main row */}
            <View className="flex-row items-center">
                {/* Image */}
                <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                    {source ? (
                        <Image source={source} className="h-full w-full" resizeMode="contain" />
                    ) : (
                        <Text className="text-2xl">🛒</Text>
                    )}
                </View>

                {/* Info */}
                <View className="ml-3 flex-1">
                    <Text className="text-[15px] font-lufga-semibold text-slate-900" numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text className="mt-0.5 text-xs font-lufga text-slate-400" numberOfLines={1}>
                        {item.store}
                    </Text>
                    {item.variant && (
                        <Text className="mt-1 text-xs font-lufga-medium text-amber-700" numberOfLines={1}>
                            {item.variant.name}
                        </Text>
                    )}
                    <Text className="mt-2 text-base font-lufga-semibold text-slate-900">
                        Rs {itemTotal.toLocaleString()}
                    </Text>
                </View>

                {/* Actions */}
                <View className="items-center gap-2">
                    {/* Delete */}
                    <Pressable
                        accessibilityLabel={`Remove ${item.name}`}
                        className="active:opacity-60"
                        onPress={() => onRemove(item.id)}
                    >
                        <Trash2 size={18} color="#ef4444" />
                    </Pressable>

                    {/* Quantity stepper */}
                    <View className="flex-row items-center rounded-full bg-slate-100 p-1">
                        <Pressable
                            className="h-7 w-7 items-center justify-center rounded-full bg-white"
                            onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        >
                            <Minus size={14} color="#1e293b" strokeWidth={2.5} />
                        </Pressable>
                        <Text className="mx-2 min-w-4 text-center text-sm font-lufga-medium text-slate-900">
                            {item.quantity}
                        </Text>
                        <Pressable
                            className="h-7 w-7 items-center justify-center rounded-full bg-[#EAB308]"
                            onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                            <Plus size={14} color="#111827" strokeWidth={2.5} />
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Extras */}
            {item.extras.length > 0 && (
                <View className="ml-23 mt-2 border-t border-slate-100 pt-2">
                    {item.extras.map((extra) => (
                        <View key={extra.id} className="flex-row items-center justify-between py-1">
                            <Text className="text-xs font-lufga text-slate-500">+ {extra.name}</Text>
                            <Text className="text-xs font-lufga-medium text-slate-700">Rs {extra.price}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Add to Monthly Grocery */}
            {isGroceryProvider && onAddToMonthly && (
                <Pressable
                    disabled={!selectedCardId || isAdding}
                    className="mt-3 flex-row items-center justify-center rounded-2xl border border-amber-300 bg-amber-50 py-3 active:opacity-70 disabled:opacity-40"
                    onPress={() => onAddToMonthly(item.productId, item.quantity)}
                >
                    <ListPlus size={17} color="#b45309" />
                    <Text className="ml-2 text-sm font-lufga-semibold text-amber-800">
                        {isAdding ? 'Adding...' : 'Add to Monthly Grocery'}
                    </Text>
                </Pressable>
            )}
        </View>
    );
}
