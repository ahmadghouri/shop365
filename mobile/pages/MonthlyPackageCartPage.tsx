import { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
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

    const { width } = useWindowDimensions();
    const isTiny = width < 340;
    const isSmall = width < 380;
    const pad = isTiny ? 14 : isSmall ? 16 : 20;
    const iconBtnSize = isTiny ? 38 : isSmall ? 40 : 44;
    const iconSize = isTiny ? 18 : isSmall ? 20 : 23;
    const headerTitleSize = isTiny ? 18 : isSmall ? 20 : 24;
    const headerSubSize = isTiny ? 10 : 12;
    const thumbSize = isTiny ? 68 : isSmall ? 72 : 80;
    const productTitleSize = isTiny ? 13 : isSmall ? 14 : 15;
    const productPriceSize = isTiny ? 13 : isSmall ? 14 : 16;
    const qtyBtnSize = isTiny ? 26 : 28;
    const qtyIconSize = isTiny ? 12 : 14;
    const summaryFontSize = isTiny ? 12 : isSmall ? 13 : 14;
    const checkoutBarPb = isTiny ? 16 : isSmall ? 20 : 28;
    const checkoutBtnHeight = isTiny ? 50 : isSmall ? 52 : 56;
    const checkoutFontSize = isTiny ? 13 : isSmall ? 14 : 16;

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
                {/* ── Header ── */}
                <View
                    style={{ paddingHorizontal: pad }}
                    className="flex-row items-center border-b border-slate-100 bg-white py-3"
                >
                    <Pressable
                        style={{ height: iconBtnSize, width: iconBtnSize }}
                        className="items-center justify-center rounded-2xl bg-slate-50"
                        onPress={onBack}
                    >
                        <ChevronLeft size={iconSize} color="#171717" />
                    </Pressable>
                    <View className="ml-3 flex-1">
                        <Text style={{ fontSize: headerTitleSize }} className="font-lufga-bold text-slate-950">
                            Package Cart
                        </Text>
                        <Text style={{ fontSize: headerSubSize, marginTop: 2 }} className="font-lufga text-slate-400" numberOfLines={1}>
                            {card.name}
                        </Text>
                    </View>
                    <Pressable
                        style={{ paddingHorizontal: isTiny ? 8 : 12, paddingVertical: isTiny ? 6 : 8 }}
                        className="flex-row items-center rounded-full bg-amber-50 active:opacity-70"
                        onPress={() => setShowAddressModal(true)}
                    >
                        <MapPin size={isTiny ? 13 : 15} color="#b77900" />
                        <Text
                            style={{ fontSize: isTiny ? 10 : 12, marginLeft: 4, maxWidth: isTiny ? 56 : 80 }}
                            className="font-lufga-semibold text-amber-700"
                            numberOfLines={1}
                        >
                            {selectedAddressLabel}
                        </Text>
                    </Pressable>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: pad, paddingTop: isTiny ? 14 : 20, gap: isTiny ? 12 : 16 }}
                >
                    {/* ── Item cards ── */}
                    {card.items.map((item) => {
                        const product = item.product_id;
                        if (!product) return null;
                        const imageUri = getMonthlyProductImage(product);
                        return (
                            <View key={item._id} style={{ padding: isTiny ? 10 : 12 }} className="rounded-3xl bg-white">
                                {/* Vendor row */}
                                <View style={{ marginBottom: isTiny ? 10 : 12, paddingBottom: isTiny ? 10 : 12 }} className="flex-row items-center border-b border-slate-100">
                                    <View
                                        style={{ height: isTiny ? 30 : 32, width: isTiny ? 30 : 32 }}
                                        className="items-center justify-center rounded-xl bg-amber-100"
                                    >
                                        <Store size={isTiny ? 14 : 16} color="#b77900" />
                                    </View>
                                    <Text style={{ fontSize: isTiny ? 11 : 13, marginLeft: isTiny ? 6 : 8 }} className="flex-1 font-lufga-semibold text-slate-800" numberOfLines={1}>
                                        {product.business_id?.name || 'Grocery Provider'}
                                    </Text>
                                </View>

                                {/* Product row */}
                                <View className="flex-row items-center">
                                    <View
                                        style={{ height: thumbSize, width: thumbSize }}
                                        className="items-center justify-center overflow-hidden rounded-2xl bg-slate-100"
                                    >
                                        {imageUri ? (
                                            <Image source={{ uri: imageUri }} style={{ width: thumbSize, height: thumbSize }} resizeMode="contain" />
                                        ) : (
                                            <Text style={{ fontSize: isTiny ? 20 : 24 }}>🛒</Text>
                                        )}
                                    </View>

                                    <View style={{ marginLeft: isTiny ? 10 : 12 }} className="flex-1">
                                        <Text style={{ fontSize: productTitleSize }} className="font-lufga-semibold text-slate-900" numberOfLines={1}>
                                            {product.title}
                                        </Text>
                                        <Text style={{ fontSize: isTiny ? 10 : 12, marginTop: 2 }} className="font-lufga text-slate-400" numberOfLines={1}>
                                            {product.business_id?.name || 'Grocery Provider'}
                                        </Text>
                                        <Text style={{ fontSize: productPriceSize, marginTop: isTiny ? 6 : 8 }} className="font-lufga-semibold text-slate-900">
                                            Rs {itemPrice(item).toLocaleString()}
                                        </Text>
                                    </View>

                                    <View style={{ marginLeft: 8 }} className="items-center gap-2">
                                        <Pressable
                                            accessibilityLabel={`Remove ${product.title}`}
                                            className="active:opacity-60"
                                            onPress={() => removeItem.mutate({ cardId: card._id, itemId: item._id })}
                                        >
                                            <Trash2 size={isTiny ? 15 : 18} color="#ef4444" />
                                        </Pressable>
                                        <View className="flex-row items-center rounded-full bg-slate-100 p-1">
                                            <Pressable
                                                disabled={item.quantity <= 1 || updateItem.isPending}
                                                style={{ height: qtyBtnSize, width: qtyBtnSize }}
                                                className="items-center justify-center rounded-full bg-white disabled:opacity-40"
                                                onPress={() => changeQuantity(item, item.quantity - 1)}
                                            >
                                                <Minus size={qtyIconSize} color="#1e293b" strokeWidth={2.5} />
                                            </Pressable>
                                            <Text style={{ fontSize: isTiny ? 12 : 14, minWidth: isTiny ? 14 : 16 }} className="text-center font-lufga-medium text-slate-900">
                                                {item.quantity}
                                            </Text>
                                            <Pressable
                                                disabled={updateItem.isPending}
                                                style={{ height: qtyBtnSize, width: qtyBtnSize }}
                                                className="items-center justify-center rounded-full bg-[#EAB308] disabled:opacity-50"
                                                onPress={() => changeQuantity(item, item.quantity + 1)}
                                            >
                                                <Plus size={qtyIconSize} color="#111827" strokeWidth={2.5} />
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    {/* ── Coupon ── */}
                    <View style={{ padding: isTiny ? 10 : 12 }} className="flex-row items-center rounded-[24px] bg-white">
                        <View
                            style={{ height: isTiny ? 38 : 44, width: isTiny ? 38 : 44 }}
                            className="items-center justify-center rounded-xl bg-pink-50"
                        >
                            <Ticket size={isTiny ? 17 : 20} color="#ec4899" />
                        </View>
                        <TextInput
                            style={{ marginLeft: isTiny ? 8 : 12, fontSize: isTiny ? 12 : 14 }}
                            className="flex-1 font-lufga text-slate-950"
                            value={coupon}
                            onChangeText={setCoupon}
                            placeholder="Add coupon code"
                            placeholderTextColor="#94a3b8"
                            autoCapitalize="characters"
                        />
                        <Pressable
                            style={{ paddingHorizontal: isTiny ? 14 : 20, paddingVertical: isTiny ? 10 : 12 }}
                            className="rounded-xl bg-[#171717]"
                            onPress={() => Alert.alert('Coupon', coupon.trim() ? 'Coupon will be verified at checkout.' : 'Enter a coupon code first.')}
                        >
                            <Text style={{ fontSize: isTiny ? 12 : 14 }} className="font-lufga-bold text-white">
                                Apply
                            </Text>
                        </Pressable>
                    </View>

                    {/* ── Order summary ── */}
                    <View style={{ padding: isTiny ? 14 : isSmall ? 16 : 20 }} className="rounded-3xl bg-white/90">
                        <Text style={{ fontSize: summaryFontSize + 2, marginBottom: isTiny ? 12 : 16 }} className="font-lufga-semibold text-slate-900">
                            Order Summary
                        </Text>
                        <View className="flex-row justify-between py-1">
                            <Text style={{ fontSize: summaryFontSize }} className="font-lufga text-slate-500">Subtotal</Text>
                            <Text style={{ fontSize: summaryFontSize }} className="font-lufga-semibold text-slate-900">
                                Rs {subtotal.toLocaleString()}
                            </Text>
                        </View>
                        <View className="flex-row justify-between py-1">
                            <Text style={{ fontSize: summaryFontSize }} className="font-lufga text-slate-500">Delivery charges</Text>
                            <Text style={{ fontSize: summaryFontSize }} className="font-lufga-semibold text-emerald-600">
                                {delivery > 0 ? `Rs ${delivery.toLocaleString()}` : 'Free'}
                            </Text>
                        </View>
                        <View style={{ marginTop: isTiny ? 12 : 16, paddingTop: isTiny ? 12 : 16 }} className="flex-row items-center justify-between border-t border-slate-100">
                            <Text style={{ fontSize: summaryFontSize + 2 }} className="font-lufga-semibold text-slate-900">Total</Text>
                            <Text style={{ fontSize: isTiny ? 20 : isSmall ? 22 : 24 }} className="font-lufga-bold text-slate-950">
                                Rs {total.toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    <View style={{ height: isTiny ? 90 : 110 }} />
                </ScrollView>

                {/* ── Checkout bar ── */}
                <View
                    style={{ paddingHorizontal: pad, paddingBottom: checkoutBarPb, paddingTop: isTiny ? 10 : 12 }}
                    className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white"
                >
                    <GradientPill style={{ height: checkoutBtnHeight }} className="rounded-2xl">
                        <Pressable
                            style={{ paddingHorizontal: isTiny ? 16 : 20 }}
                            className="flex-1 flex-row items-center justify-between active:opacity-85"
                            onPress={() => Alert.alert('Monthly Package Checkout', `${card.name} is ready for checkout.`)}
                        >
                            <Text style={{ fontSize: checkoutFontSize }} className="font-lufga-bold text-slate-950">
                                Proceed to checkout
                            </Text>
                            <Text style={{ fontSize: checkoutFontSize }} className="font-lufga-bold text-slate-950">
                                Rs {total.toLocaleString()} →
                            </Text>
                        </Pressable>
                    </GradientPill>
                </View>
            </SafeAreaView>

            {/* ── Address modal ── */}
            <Modal
                visible={showAddressModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddressModal(false)}
            >
                <Pressable className="flex-1 justify-end bg-black/45" onPress={() => setShowAddressModal(false)}>
                    <Pressable
                        style={{ paddingHorizontal: pad, paddingBottom: isTiny ? 24 : 32, paddingTop: isTiny ? 14 : 16 }}
                        className="max-h-[78%] rounded-t-[32px] bg-white"
                        onPress={(event) => event.stopPropagation()}
                    >
                        <View style={{ marginBottom: isTiny ? 12 : 16 }} className="flex-row items-center justify-between">
                            <View>
                                <Text style={{ fontSize: isTiny ? 18 : 22 }} className="font-lufga-bold text-slate-950">
                                    Choose Address
                                </Text>
                                <Text style={{ fontSize: isTiny ? 11 : 13, marginTop: 4 }} className="font-lufga text-slate-400">
                                    Select a saved delivery address
                                </Text>
                            </View>
                            <Pressable
                                style={{ height: iconBtnSize, width: iconBtnSize }}
                                className="items-center justify-center rounded-full bg-slate-100 active:opacity-60"
                                onPress={() => setShowAddressModal(false)}
                            >
                                <ChevronLeft size={iconSize} color="#334155" />
                            </Pressable>
                        </View>
                        <View style={{ height: isTiny ? 380 : 480 }}>
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