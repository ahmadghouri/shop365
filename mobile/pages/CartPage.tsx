import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Trash2, Plus, Minus, X } from 'lucide-react-native';
import { useCartStore, DELIVERY_FEE_AMOUNT } from '@/lib/cartStore';

type CartPageProps = {
    onBack?: () => void;
    onCheckout?: () => void;
};

export function CartPage({ onBack, onCheckout }: CartPageProps) {
    const { items, updateQuantity, removeItem, removeExtra, getSubtotal, getTotal } = useCartStore();

    const subtotal = getSubtotal();
    const total = getTotal();

    return (
        <LinearGradient colors={['#FFD54F', '#FFF9E6', '#FFFFFF']} style={{ flex: 1 }}>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header */}
                <View className="flex-row items-center px-5 pt-2 pb-3">
                    {onBack && (
                        <Pressable className="-ml-1 mr-2 active:opacity-60" onPress={onBack}>
                            <ChevronLeft size={26} color="#1e293b" />
                        </Pressable>
                    )}
                    <Text className="flex-1 text-2xl font-lufga-bold text-slate-900">My Cart</Text>
                    <Text className="text-sm font-lufga text-slate-400">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                    </Text>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {items.length === 0 ? (
                        <View className="items-center justify-center pt-32">
                            <Text className="text-5xl">🛒</Text>
                            <Text className="mt-4 text-lg font-lufga text-slate-400">Your cart is empty</Text>
                        </View>
                    ) : (
                        <View className="px-5 gap-3 mt-2">
                            {items.map((item) => {
                                const source = item.imageUri ? { uri: item.imageUri } : item.image;
                                const extrasTotal = item.extras.reduce((s, e) => s + e.price, 0);
                                const itemTotal = (item.price + extrasTotal) * item.quantity;

                                return (
                                    <View key={item.id} className="rounded-2xl bg-white/80 p-3">
                                        <View className="flex-row items-center">
                                            {/* Product image */}
                                            <View className="h-20 w-20 items-center justify-center rounded-xl bg-[#F0F0F0] overflow-hidden">
                                                {source ? (
                                                    <Image source={source} className="w-full h-full" resizeMode="contain" />
                                                ) : (
                                                    <Text className="text-2xl">🛒</Text>
                                                )}
                                            </View>

                                            {/* Info */}
                                            <View className="ml-3 flex-1">
                                                <Text className="text-[15px] font-lufga-medium text-slate-900" numberOfLines={1}>
                                                    {item.name}
                                                </Text>
                                                <Text className="text-xs font-lufga text-slate-400 mt-0.5" numberOfLines={1}>
                                                    {item.store}
                                                </Text>
                                                <Text className="mt-2 text-base font-lufga-semibold text-slate-900">
                                                    Rs {itemTotal.toLocaleString()}
                                                </Text>
                                            </View>

                                            {/* Quantity & Remove */}
                                            <View className="items-center gap-2">
                                                <Pressable
                                                    accessibilityLabel={`Remove ${item.name}`}
                                                    className="active:opacity-60"
                                                    onPress={() => removeItem(item.id)}
                                                >
                                                    <Trash2 size={18} color="#ef4444" />
                                                </Pressable>

                                                <View className="flex-row items-center rounded-full bg-slate-100 p-1">
                                                    <Pressable
                                                        className="h-7 w-7 items-center justify-center rounded-full bg-white active:opacity-70"
                                                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Minus size={14} color="#1e293b" strokeWidth={2.5} />
                                                    </Pressable>
                                                    <Text className="mx-2 min-w-4 text-center text-sm font-lufga-medium text-slate-900">
                                                        {item.quantity}
                                                    </Text>
                                                    <Pressable
                                                        className="h-7 w-7 items-center justify-center rounded-full bg-[#EAB308] active:opacity-70"
                                                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus size={14} color="#111827" strokeWidth={2.5} />
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Extras list */}
                                        {item.extras.length > 0 && (
                                            <View className="mt-2 ml-23 border-t border-slate-100 pt-2">
                                                {item.extras.map((extra) => (
                                                    <View key={extra.id} className="flex-row items-center justify-between py-1">
                                                        <Text className="text-xs font-lufga text-slate-500">
                                                            + {extra.name}
                                                        </Text>
                                                        <View className="flex-row items-center gap-2">
                                                            <Text className="text-xs font-lufga-medium text-slate-700">
                                                                Rs {extra.price}
                                                            </Text>
                                                            <Pressable
                                                                accessibilityLabel={`Remove ${extra.name}`}
                                                                className="active:opacity-60"
                                                                onPress={() => removeExtra(item.id, extra.id)}
                                                            >
                                                                <X size={14} color="#94a3b8" />
                                                            </Pressable>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Order summary */}
                    {items.length > 0 && (
                        <View className="mx-5 mt-6 rounded-2xl bg-white/80 p-4">
                            <Text className="text-base font-lufga-semibold text-slate-900 mb-3">Order Summary</Text>

                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm font-lufga text-slate-500">Subtotal</Text>
                                <Text className="text-sm font-lufga-medium text-slate-800">
                                    Rs {subtotal.toLocaleString()}
                                </Text>
                            </View>

                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm font-lufga text-slate-500">Delivery Fee</Text>
                                <Text className="text-sm font-lufga-medium text-slate-800">
                                    Rs {DELIVERY_FEE_AMOUNT}
                                </Text>
                            </View>

                            <View className="border-t border-slate-100 mt-2 pt-3 flex-row justify-between">
                                <Text className="text-base font-lufga-semibold text-slate-900">Total</Text>
                                <Text className="text-lg font-lufga-bold text-slate-900">
                                    Rs {total.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    )}

                    <View className="h-32" />
                </ScrollView>

                {/* Checkout bar */}
                {items.length > 0 && (
                    <View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-5 pb-7 pt-3">
                        <Pressable
                            className="items-center justify-center rounded-full bg-[#EAB308] py-4 active:opacity-80"
                            onPress={onCheckout}
                        >
                            <Text className="text-base font-lufga-semibold text-slate-900">
                                Checkout - Rs {total.toLocaleString()}
                            </Text>
                        </Pressable>
                    </View>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}
