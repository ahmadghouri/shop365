import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, ShoppingBasket } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import VendorMinOrderModal from '@/components/VendorMinOrderModal';
import { GradientPill } from '@/components/reusable/GradientPill';
import { MonthlyCardSelector } from '@/components/MonthlyCardSelector';
import { CartItem } from '@/components/cart/CartItem';
import {
    useAddMonthlyGroceryItem,
    useMonthlyGroceryCards,
} from '@/api/monthly-grocery/useMonthlyGroceryQueries';
import { useCartStore } from '@/lib/cartStore';

type CartPageProps = {
    onBack?: () => void;
    onCheckout?: () => void;
    onMonthlyGrocery?: () => void;
};

export function CartPage({ onBack, onCheckout, onMonthlyGrocery }: CartPageProps) {
    const { items, updateQuantity, removeItem, getSubtotal, getTotal, deliveryFee, vendorGroups } = useCartStore();
    const { data: monthlyCards = [] } = useMonthlyGroceryCards();
    const addMonthlyItem = useAddMonthlyGroceryItem();
    const [selectedCardId, setSelectedCardId] = useState('');
    const [showCardSelector, setShowCardSelector] = useState(false);
    const [addingProductId, setAddingProductId] = useState('');
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [failedVendors, setFailedVendors] = useState<any[]>([]);

    useEffect(() => {
        if (!selectedCardId && monthlyCards.length > 0) setSelectedCardId(monthlyCards[0]._id);
        if (selectedCardId && !monthlyCards.some((card) => card._id === selectedCardId)) {
            setSelectedCardId(monthlyCards[0]?._id || '');
        }
    }, [monthlyCards, selectedCardId]);

    const subtotal = getSubtotal();
    const total = getTotal();

    const handleCheckout = () => {
        const failed = vendorGroups.filter((g) => !g.meets_min_order);
        if (failed.length > 0) {
            setFailedVendors(failed);
            setShowVendorModal(true);
            return;
        }
        onCheckout?.();
    };

    const handleCheckoutWithoutVendors = () => {
        // remove items that belong to vendors who don't meet min order
        failedVendors.forEach((g) => {
            items.filter((item) => (item as any).business_id === g.business_id).forEach((it) => removeItem((it as any).id));
        });
        setShowVendorModal(false);
        onCheckout?.();
    };

    const handleAddToMonthly = async (productId: string, quantity: number) => {
        if (!selectedCardId) {
            Alert.alert('Select a card', 'Create or select a Monthly Grocery card first.');
            return;
        }
        try {
            setAddingProductId(productId);
            await addMonthlyItem.mutateAsync({ cardId: selectedCardId, productId, quantity });
            const card = monthlyCards.find((entry) => entry._id === selectedCardId);
            Alert.alert('Added successfully', `Product added to ${card?.name || 'your monthly card'}.`);
        } catch (error: any) {
            Alert.alert('Could not add product', error?.response?.data?.message || 'Please try again.');
        } finally {
            setAddingProductId('');
        }
    };

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <View className="flex-row items-center px-5 pb-3 pt-2">
                    {onBack && (
                        <Pressable className="-ml-1 mr-2 h-10 w-10 items-center justify-center rounded-full bg-white/70 active:opacity-60" onPress={onBack}>
                            <ChevronLeft size={24} color="#1e293b" />
                        </Pressable>
                    )}
                    <View className="flex-1">
                        <Text className="text-2xl font-lufga-bold text-slate-900">My Cart</Text>
                        <Text className="text-xs font-lufga text-slate-500">{items.length} {items.length === 1 ? 'item' : 'items'} ready</Text>
                    </View>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="mx-5 mt-2 rounded-[28px] bg-slate-900 p-4">
                        <View className="flex-row items-center">
                            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-amber-400">
                                <ShoppingBasket size={24} color="#0f172a" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-lg font-lufga-bold text-white">Monthly Grocery</Text>
                                <Text className="mt-0.5 text-xs font-lufga text-slate-300">Plan your monthly essentials and keep every list organized</Text>
                            </View>
                            <Pressable className="rounded-full bg-white/10 px-3 py-2 active:opacity-60" onPress={onMonthlyGrocery}>
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
                                <Text className="ml-2 font-lufga-semibold text-slate-900">Create your first monthly card</Text>
                            </Pressable>
                        )}
                    </View>

                    {items.length === 0 ? (
                        <View className="items-center justify-center px-5 pt-20">
                            <Text className="text-5xl">🛒</Text>
                            <Text className="mt-4 text-lg font-lufga-semibold text-slate-700">Your cart is empty</Text>
                            <Text className="mt-1 text-center text-sm font-lufga text-slate-400">Add Grocery products, then save them to your monthly card here.</Text>
                        </View>
                    ) : (
                        <View className="mt-5 gap-3 px-5">
                            {items.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    selectedCardId={selectedCardId}
                                    isAdding={addingProductId === item.productId}
                                    onRemove={removeItem}
                                    onUpdateQuantity={updateQuantity}
                                    onAddToMonthly={handleAddToMonthly}
                                />
                            ))}
                        </View>
                    )}

                    {items.length > 0 && (
                        <View className="mx-5 mt-6 rounded-3xl bg-white/85 p-4">
                            <Text className="mb-3 text-base font-lufga-semibold text-slate-900">Order Summary</Text>

                            {vendorGroups.map((group) => (
                                <View key={group.business_id} className="mb-3 rounded-xl bg-slate-50 px-3 py-2">
                                    <Text className="mb-1 text-xs font-lufga-semibold text-slate-700">{group.business_name}</Text>
                                    <View className="flex-row justify-between">
                                        <Text className="text-xs font-lufga text-slate-500">Subtotal</Text>
                                        <Text className="text-xs font-lufga-medium text-slate-700">Rs {group.subtotal.toLocaleString()}</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-xs font-lufga text-slate-500">Delivery Fee</Text>
                                        <Text className="text-xs font-lufga-medium text-slate-700">Rs {group.delivery_fee}</Text>
                                    </View>
                                    {!group.meets_min_order && (
                                        <Text className="mt-1 text-xs font-lufga-medium text-amber-600">
                                            Min order Rs {group.min_order_price.toLocaleString()}. Add Rs {(group.min_order_price - group.subtotal).toLocaleString()} more.
                                        </Text>
                                    )}
                                </View>
                            ))}

                            <View className="mb-2 mt-1 flex-row justify-between border-t border-slate-100 pt-2">
                                <Text className="text-sm font-lufga text-slate-500">Total Delivery</Text>
                                <Text className="text-sm font-lufga-medium text-slate-800">Rs {deliveryFee}</Text>
                            </View>
                            <View className="mt-2 flex-row justify-between border-t border-slate-100 pt-3">
                                <Text className="text-base font-lufga-semibold text-slate-900">Total</Text>
                                <Text className="text-lg font-lufga-bold text-slate-900">Rs {total.toLocaleString()}</Text>
                            </View>
                        </View>
                    )}

                    <View className="h-32" />
                </ScrollView>

                {items.length > 0 && (
                    <View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-5 pb-7 pt-3">
                            <GradientPill className="w-full rounded-full h-14">
                                <Pressable className="h-14 w-full items-center justify-center rounded-full" onPress={handleCheckout}>
                                <Text className="text-base font-lufga-semibold text-slate-900">
                                    {`Checkout - Rs ${total.toLocaleString()}`}
                                </Text>
                            </Pressable>
                        </GradientPill>
                    </View>
                )}
                <VendorMinOrderModal
                    visible={showVendorModal}
                    vendors={failedVendors}
                    onClose={() => setShowVendorModal(false)}
                    onCheckoutWithoutVendors={handleCheckoutWithoutVendors}
                />
            </SafeAreaView>
        </AppBackground>
    );
}