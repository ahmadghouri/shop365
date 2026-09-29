import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { LocationAddressManager } from '@/components/LocationAddressManager';
import { CartItem, type CartItemType } from '@/components/cart/CartItem';
import { CartCheckoutBar } from '@/components/cart/CartCheckoutBar';
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
    const summaryFontSize = isTiny ? 12 : isSmall ? 13 : 14;

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
                    {/* ── Item cards (shared CartItem, same as My Cart) ── */}
                    {card.items.map((item) => {
                        const product = item.product_id;
                        if (!product) return null;
                        const imageUri = getMonthlyProductImage(product);
                        const unitPrice = Number(product.final_price ?? product.price ?? 0);
                        const cartItem: CartItemType = {
                            id: item._id,
                            productId: String(product._id ?? product.id ?? item._id),
                            name: product.title,
                            store: product.business_id?.name || 'Grocery Provider',
                            price: item.variant?.price || unitPrice,
                            quantity: item.quantity,
                            imageUri: imageUri || undefined,
                            extras: [],
                            variant: item.variant?.name
                                ? { name: item.variant.name, price: item.variant.price ?? unitPrice }
                                : undefined,
                        };
                        return (
                            <CartItem
                                key={item._id}
                                item={cartItem}
                                showVendor
                                onRemove={() => removeItem.mutate({ cardId: card._id, itemId: item._id })}
                                onUpdateQuantity={(_id, quantity) => changeQuantity(item, quantity)}
                            />
                        );
                    })}

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

                {/* ── Checkout bar (same as My Cart) ── */}
                <CartCheckoutBar
                    total={total}
                    onCheckout={() =>
                        Alert.alert('Monthly Package Checkout', `${card.name} is ready for checkout.`)
                    }
                />
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