import { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Minus, Plus, Store, Ticket, Trash2 } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { LocationAddressManager } from '@/components/LocationAddressManager';
import { GradientPill } from '@/components/reusable/GradientPill';
import {
    getMonthlyProductImage,
    updateMonthlyGroceryAddress,
    type MonthlyGroceryCard,
    type MonthlyGroceryItem,
} from '@/api/monthly-grocery/monthly-grocery.service';
import type { Address } from '@/api/addresses/address.service';
import {
    useRemoveMonthlyGroceryItem,
    useMonthlyGrocerySummary,
    useUpdateMonthlyGroceryItem,
} from '@/api/monthly-grocery/useMonthlyGroceryQueries';

type MonthlyPackageCartPageProps = {
    card: MonthlyGroceryCard;
    onBack: () => void;
};

function itemPrice(item: MonthlyGroceryItem) {
    const product = item.product_id;
    return Number(product?.final_price ?? product?.price ?? 0) * item.quantity;
}

export function MonthlyPackageCartPage({ card, onBack }: MonthlyPackageCartPageProps) {
    const [coupon, setCoupon] = useState('');
    const linkedAddress = typeof card.address_id === 'object' && card.address_id ? card.address_id : null;
    const linkedAddressId = linkedAddress?._id || (typeof card.address_id === 'string' ? card.address_id : null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedAddressLabel, setSelectedAddressLabel] = useState(card.address_name || linkedAddress?.label || 'Address');
    const updateItem = useUpdateMonthlyGroceryItem();
    const removeItem = useRemoveMonthlyGroceryItem();
    const { data: summary } = useMonthlyGrocerySummary(card._id);

    const fallbackSubtotal = card.items.reduce((sum, item) => sum + itemPrice(item), 0);
    const subtotal = summary?.subtotal ?? fallbackSubtotal;
    const delivery = summary?.delivery ?? 0;
    const total = summary?.total ?? subtotal + delivery;

    const handleAddressSelected = async (address: Address) => {
        try {
            await updateMonthlyGroceryAddress(card._id, address._id);
            setSelectedAddressLabel(address.label);
            setShowAddressModal(false);
        } catch {
            Alert.alert('Could not save address', 'Please try selecting the address again.');
        }
    };

    const handleAddressChanged = (address: Address) => {
        if (address._id === linkedAddressId) setSelectedAddressLabel(address.label);
    };

    const changeQuantity = (item: MonthlyGroceryItem, quantity: number) => {
        if (quantity < 1 || updateItem.isPending) return;
        updateItem.mutate({ cardId: card._id, itemId: item._id, updates: { quantity } });
    };

    return (
        <AppBackground>
            <SafeAreaView className="flex-1 bg-transparent" edges={['top', 'left', 'right']}>
                <View className="flex-row items-center border-b border-slate-100 bg-white px-5 py-3">
                    <Pressable className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-50" onPress={onBack}>
                        <ChevronLeft size={23} color="#171717" />
                    </Pressable>
                    <View className="ml-4 flex-1">
                        <Text className="text-2xl font-lufga-bold text-slate-950">Package Cart</Text>
                        <Text className="mt-0.5 text-xs font-lufga text-slate-400" numberOfLines={1}>{card.name}</Text>
                    </View>
                    <Pressable
                        className="flex-row items-center rounded-full bg-amber-50 px-3 py-2 active:opacity-70"
                        onPress={() => setShowAddressModal(true)}
                    >
                        <MapPin size={15} color="#b77900" />
                        <Text className="ml-1 max-w-20 text-xs font-lufga-semibold text-amber-700" numberOfLines={1}>
                            {selectedAddressLabel}
                        </Text>
                    </Pressable>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="gap-4 px-5 pt-5">
                        {card.items.map((item) => {
                            const product = item.product_id;
                            if (!product) return null;
                            const imageUri = getMonthlyProductImage(product);
                            return (
                                <View key={item._id} className="rounded-3xl bg-white p-3">
                                    <View className="mb-3 flex-row items-center border-b border-slate-100 pb-3">
                                        <View className="h-8 w-8 items-center justify-center rounded-xl bg-amber-100">
                                            <Store size={16} color="#b77900" />
                                        </View>
                                        <Text className="ml-2 flex-1 text-sm font-lufga-semibold text-slate-800" numberOfLines={1}>
                                            {product.business_id?.name || 'Grocery Provider'}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                                            {imageUri ? (
                                                <Image source={{ uri: imageUri }} className="h-full w-full" resizeMode="contain" />
                                            ) : (
                                                <Text className="text-2xl">🛒</Text>
                                            )}
                                        </View>

                                        <View className="ml-3 flex-1">
                                            <Text className="text-[15px] font-lufga-semibold text-slate-900" numberOfLines={1}>
                                                {product.title}
                                            </Text>
                                            <Text className="mt-0.5 text-xs font-lufga text-slate-400" numberOfLines={1}>
                                                {product.business_id?.name || 'Grocery Provider'}
                                            </Text>
                                            <Text className="mt-2 text-base font-lufga-semibold text-slate-900">
                                                Rs {itemPrice(item).toLocaleString()}
                                            </Text>
                                        </View>

                                        <View className="items-center gap-2">
                                            <Pressable
                                                accessibilityLabel={`Remove ${product.title}`}
                                                className="active:opacity-60"
                                                onPress={() => removeItem.mutate({ cardId: card._id, itemId: item._id })}
                                            >
                                                <Trash2 size={18} color="#ef4444" />
                                            </Pressable>
                                            <View className="flex-row items-center rounded-full bg-slate-100 p-1">
                                                <Pressable
                                                    disabled={item.quantity <= 1 || updateItem.isPending}
                                                    className="h-7 w-7 items-center justify-center rounded-full bg-white disabled:opacity-40"
                                                    onPress={() => changeQuantity(item, item.quantity - 1)}
                                                >
                                                    <Minus size={14} color="#1e293b" strokeWidth={2.5} />
                                                </Pressable>
                                                <Text className="mx-2 min-w-4 text-center text-sm font-lufga-medium text-slate-900">
                                                    {item.quantity}
                                                </Text>
                                                <Pressable
                                                    disabled={updateItem.isPending}
                                                    className="h-7 w-7 items-center justify-center rounded-full bg-[#EAB308] disabled:opacity-50"
                                                    onPress={() => changeQuantity(item, item.quantity + 1)}
                                                >
                                                    <Plus size={14} color="#111827" strokeWidth={2.5} />
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}

                        <View className="flex-row items-center rounded-[24px] bg-white p-3">
                            <View className="h-11 w-11 items-center justify-center rounded-xl bg-pink-50">
                                <Ticket size={20} color="#ec4899" />
                            </View>
                            <TextInput
                                className="ml-3 flex-1 font-lufga text-slate-950"
                                value={coupon}
                                onChangeText={setCoupon}
                                placeholder="Add coupon code"
                                placeholderTextColor="#94a3b8"
                                autoCapitalize="characters"
                            />
                            <Pressable
                                className="rounded-xl bg-[#171717] px-5 py-3"
                                onPress={() => Alert.alert('Coupon', coupon.trim() ? 'Coupon will be verified at checkout.' : 'Enter a coupon code first.')}
                            >
                                <Text className="font-lufga-bold text-white">Apply</Text>
                            </Pressable>
                        </View>

                        <View className="rounded-3xl bg-white/90 p-5">
                            <Text className="mb-4 text-base font-lufga-semibold text-slate-900">Order Summary</Text>
                            <View className="flex-row justify-between py-1">
                                <Text className="text-sm font-lufga text-slate-500">Subtotal</Text>
                                <Text className="text-sm font-lufga-semibold text-slate-900">Rs {subtotal.toLocaleString()}</Text>
                            </View>
                            <View className="flex-row justify-between py-1">
                                <Text className="text-sm font-lufga text-slate-500">Delivery charges</Text>
                                <Text className="text-sm font-lufga-semibold text-emerald-600">
                                    {delivery > 0 ? `Rs ${delivery.toLocaleString()}` : 'Free'}
                                </Text>
                            </View>
                            <View className="mt-4 flex-row items-center justify-between border-t border-slate-100 pt-4">
                                <Text className="text-base font-lufga-semibold text-slate-900">Total</Text>
                                <Text className="text-2xl font-lufga-bold text-slate-950">Rs {total.toLocaleString()}</Text>
                            </View>
                        </View>
                    </View>
                    <View className="h-32" />
                </ScrollView>

                <View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-5 pb-7 pt-3">
                    <GradientPill className="h-14 rounded-2xl">
                        <Pressable
                            className="flex-1 flex-row items-center justify-between px-5 active:opacity-85"
                            onPress={() => Alert.alert('Monthly Package Checkout', `${card.name} is ready for checkout.`)}
                        >
                            <Text className="text-base font-lufga-bold text-slate-950">Proceed to checkout</Text>
                            <Text className="text-base font-lufga-bold text-slate-950">Rs {total.toLocaleString()} →</Text>
                        </Pressable>
                    </GradientPill>
                </View>
            </SafeAreaView>
            <Modal
                visible={showAddressModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddressModal(false)}
            >
                <Pressable className="flex-1 justify-end bg-black/45" onPress={() => setShowAddressModal(false)}>
                    <Pressable
                        className="max-h-[78%] rounded-t-[32px] bg-white px-5 pb-8 pt-4"
                        onPress={(event) => event.stopPropagation()}
                    >
                        <View className="mb-4 flex-row items-center justify-between">
                            <View>
                                <Text className="text-2xl font-lufga-bold text-slate-950">Choose Address</Text>
                                <Text className="mt-1 text-sm font-lufga text-slate-400">Select a saved delivery address</Text>
                            </View>
                            <Pressable
                                className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:opacity-60"
                                onPress={() => setShowAddressModal(false)}
                            >
                                <ChevronLeft size={20} color="#334155" />
                            </Pressable>
                        </View>
                        <View className="h-[480px]">
                            <LocationAddressManager
                                onAddressSelected={handleAddressSelected}
                                onAddressChanged={handleAddressChanged}
                            />
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </AppBackground>
    );
}