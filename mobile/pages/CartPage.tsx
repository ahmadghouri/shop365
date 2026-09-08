import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, ShoppingBasket } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { MonthlyCardSelector } from '@/components/MonthlyCardSelector';
import { CartItem } from '@/components/cart/CartItem';
import { useMonthlyGroceryCards } from '@/api/monthly-grocery/useMonthlyGroceryQueries';
import { useCartStore, DELIVERY_FEE_AMOUNT } from '@/lib/cartStore';

type CartPageProps = {
    onBack?: () => void;
    onCheckout?: () => void;
    onMonthlyGrocery?: () => void;
};

export function CartPage({ onBack, onCheckout, onMonthlyGrocery }: CartPageProps) {
    const { items, updateQuantity, removeItem, getSubtotal, getTotal } = useCartStore();
    const { data: monthlyCards = [] } = useMonthlyGroceryCards();
    const [selectedCardId, setSelectedCardId] = useState('');
    const [showCardSelector, setShowCardSelector] = useState(false);

    useEffect(() => {
        if (!selectedCardId && monthlyCards.length > 0) setSelectedCardId(monthlyCards[0]._id);
        if (selectedCardId && !monthlyCards.some((card) => card._id === selectedCardId)) {
            setSelectedCardId(monthlyCards[0]?._id || '');
        }
    }, [monthlyCards, selectedCardId]);

    const subtotal = getSubtotal();
    const total = getTotal();

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
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
                            {items.length} {items.length === 1 ? 'item' : 'items'} ready
                        </Text>
                    </View>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Monthly Grocery Banner */}
                    <View className="mx-5 mt-2 rounded-[28px] bg-slate-900 p-4">
                        <View className="flex-row items-center">
                            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-amber-400">
                                <ShoppingBasket size={24} color="#0f172a" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-lg font-lufga-bold text-white">Monthly Grocery</Text>
                                <Text className="mt-0.5 text-xs font-lufga text-slate-300">
                                    Plan your monthly essentials and keep every list organized
                                </Text>
                            </View>
                            <Pressable
                                className="rounded-full bg-white/10 px-3 py-2 active:opacity-60"
                                onPress={onMonthlyGrocery}
                            >
                                <Text className="text-xs font-lufga-semibold text-amber-300">View</Text>
                            </Pressable>
                        </View>

                        {monthlyCards.length > 0 ? (
                            <MonthlyCardSelector
                                cards={monthlyCards}
                                selectedCardId={selectedCardId}
                                open={showCardSelector}
                                onOpen={() => setShowCardSelector(true)}
                                onClose={() => setShowCardSelector(false)}
                                onSelect={setSelectedCardId}
                                onCreate={() => onMonthlyGrocery?.()}
                            />
                        ) : (
                            <Pressable
                                className="mt-3 flex-row items-center justify-center rounded-2xl bg-white px-4 py-3 active:opacity-70"
                                onPress={onMonthlyGrocery}
                            >
                                <Plus size={18} color="#b45309" />
                                <Text className="ml-2 font-lufga-semibold text-slate-900">
                                    Create your first monthly card
                                </Text>
                            </Pressable>
                        )}
                    </View>

                    {items.length === 0 ? (
                        <View className="items-center justify-center px-5 pt-20">
                            <Text className="text-5xl">🛒</Text>
                            <Text className="mt-4 text-lg font-lufga-semibold text-slate-700">Your cart is empty</Text>
                            <Text className="mt-1 text-center text-sm font-lufga text-slate-400">
                                Add Grocery products, then save them to your monthly card here.
                            </Text>
                        </View>
                    ) : (
                        <View className="mt-5 gap-3 px-5">
                            {items.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    onRemove={removeItem}
                                    onUpdateQuantity={updateQuantity}
                                />
                            ))}
                        </View>
                    )}

                    {items.length > 0 && (
                        <View className="mx-5 mt-6 rounded-3xl bg-white/85 p-4">
                            <Text className="mb-3 text-base font-lufga-semibold text-slate-900">Order Summary</Text>
                            <View className="mb-2 flex-row justify-between">
                                <Text className="text-sm font-lufga text-slate-500">Subtotal</Text>
                                <Text className="text-sm font-lufga-medium text-slate-800">
                                    Rs {subtotal.toLocaleString()}
                                </Text>
                            </View>
                            <View className="mb-2 flex-row justify-between">
                                <Text className="text-sm font-lufga text-slate-500">Delivery Fee</Text>
                                <Text className="text-sm font-lufga-medium text-slate-800">
                                    Rs {DELIVERY_FEE_AMOUNT}
                                </Text>
                            </View>
                            <View className="mt-2 flex-row justify-between border-t border-slate-100 pt-3">
                                <Text className="text-base font-lufga-semibold text-slate-900">Total</Text>
                                <Text className="text-lg font-lufga-bold text-slate-900">
                                    Rs {total.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    )}
                    <View className="h-32" />
                </ScrollView>

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
        </AppBackground>
    );
}
