import { useMemo, useState } from 'react';
import DateTimePicker, { type DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import {
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/AppBackground';
import { LocationAddressManager } from '@/components/LocationAddressManager';
import { GradientPill } from '@/components/reusable/GradientPill';
import {
    Calendar,
    ChevronLeft,
    MapPin,
    Minus,
    PackageOpen,
    Plus,
    Trash2,
} from 'lucide-react-native';
import {
    getMonthlyProductImage,
    updateMonthlyGroceryAddress,
    type MonthlyGroceryCard,
} from '@/api/monthly-grocery/monthly-grocery.service';
import type { Address } from '@/api/addresses/address.service';
import {
    useRemoveMonthlyGroceryItem,
    useUpdateMonthlyGroceryCard,
    useUpdateMonthlyGroceryItem,
} from '@/api/monthly-grocery/useMonthlyGroceryQueries';
import { cardTotal } from './cardTotal';

type PackageDetailViewProps = {
    card: MonthlyGroceryCard;
    onBack: () => void;
    onDelete: () => void;
    onGoToCart: () => void;
};

export function PackageDetailView({ card, onBack, onDelete, onGoToCart }: PackageDetailViewProps) {
    const linkedAddress = typeof card.address_id === 'object' && card.address_id ? card.address_id : null;
    const linkedAddressId = linkedAddress?._id || (typeof card.address_id === 'string' ? card.address_id : null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showAutoOrderPicker, setShowAutoOrderPicker] = useState(false);
    const [autoOrderDate, setAutoOrderDate] = useState(card.auto_order_date ? new Date(card.auto_order_date) : null);
    const [draftAutoOrderDate, setDraftAutoOrderDate] = useState<Date | null>(autoOrderDate);
    const [selectedAddressLabel, setSelectedAddressLabel] = useState(card.address_name || linkedAddress?.label || 'Address');
    const updateItem = useUpdateMonthlyGroceryItem();
    const removeItem = useRemoveMonthlyGroceryItem();
    const updateCard = useUpdateMonthlyGroceryCard();
    const calendarStyles = useDefaultStyles();
    const items = card.items;
    const completed = items.filter((item) => item.checked).length;
    const total = useMemo(() => cardTotal(card), [card]);

    const { width } = useWindowDimensions();
    const isTiny = width < 340;
    const isSmall = width < 380;
    const pad = isTiny ? 14 : isSmall ? 16 : 20;
    const iconBtnSize = isTiny ? 38 : isSmall ? 40 : 44;
    const iconSize = isTiny ? 18 : isSmall ? 20 : 23;
    const headerTitleSize = isTiny ? 15 : isSmall ? 17 : 20;
    const headerSubSize = isTiny ? 10 : 12;
    const bannerPad = isTiny ? 14 : isSmall ? 16 : 20;
    const bannerTitleSize = isTiny ? 18 : isSmall ? 20 : 24;
    const bannerSubSize = isTiny ? 11 : isSmall ? 12 : 13;
    const sectionTitleSize = isTiny ? 15 : isSmall ? 16 : 18;
    const thumbSize = isTiny ? 68 : isSmall ? 72 : 80;
    const productTitleSize = isTiny ? 13 : isSmall ? 14 : 15;
    const productPriceSize = isTiny ? 13 : isSmall ? 14 : 16;
    const qtyBtnSize = isTiny ? 26 : 28;
    const qtyIconSize = isTiny ? 12 : 14;

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

    const handleAutoOrderDate = ({ date }: { date: DateType }) => {
        if (!date) return;
        const nextDate = date instanceof Date
            ? date
            : typeof date === 'object' && 'toDate' in date
                ? date.toDate()
                : new Date(date);
        nextDate.setHours(0, 0, 0, 0);
        setDraftAutoOrderDate(nextDate);
    };

    const saveAutoOrderDate = async () => {
        if (!draftAutoOrderDate) return;
        setAutoOrderDate(draftAutoOrderDate);
        setShowAutoOrderPicker(false);
        await updateCard.mutateAsync({
            cardId: card._id,
            name: card.name,
            autoOrderEnabled: true,
            autoOrderDate: draftAutoOrderDate.toISOString(),
        });
    };

    const openAutoOrderPicker = () => {
        setDraftAutoOrderDate(autoOrderDate || new Date());
        setShowAutoOrderPicker(true);
    };

    const autoOrderLabel = autoOrderDate
        ? autoOrderDate.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Set date';

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* ── Header ── */}
                <View
                    style={{ paddingHorizontal: pad }}
                    className="flex-row items-center bg-white/80 py-3"
                >
                    <Pressable
                        style={{ height: iconBtnSize, width: iconBtnSize }}
                        className="items-center justify-center rounded-2xl bg-slate-50"
                        onPress={onBack}
                    >
                        <ChevronLeft size={iconSize} color="#171717" />
                    </Pressable>
                    <View className="ml-3 flex-1">
                        <Text
                            style={{ fontSize: headerTitleSize }}
                            className="font-lufga-bold text-slate-950"
                            numberOfLines={1}
                        >
                            {card.name}
                        </Text>
                        <Text style={{ fontSize: headerSubSize, marginTop: 2 }} className="font-lufga text-slate-400">
                            {completed} of {items.length} completed
                        </Text>
                    </View>
                    <Pressable
                        style={{ paddingHorizontal: isTiny ? 8 : 12, paddingVertical: isTiny ? 6 : 8, marginRight: isTiny ? 6 : 8 }}
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
                    <Pressable
                        style={{ height: iconBtnSize, width: iconBtnSize }}
                        className="items-center justify-center rounded-full bg-red-50"
                        onPress={onDelete}
                    >
                        <Trash2 size={isTiny ? 15 : 18} color="#ef4444" />
                    </Pressable>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* ── Summary banner ── */}
                    <View
                        style={{ marginHorizontal: pad, padding: bannerPad, marginTop: isTiny ? 14 : 20 }}
                        className="rounded-[28px] bg-[#1D1D1D]"
                    >
                        <Text style={{ fontSize: isTiny ? 9 : 11 }} className="font-lufga-semibold uppercase tracking-widest text-amber-300">
                            Grocery Package
                        </Text>
                        <Text style={{ fontSize: bannerTitleSize, marginTop: isTiny ? 6 : 8 }} className="font-lufga-bold text-white">
                            {card.name}
                        </Text>
                        <View style={{ marginTop: isTiny ? 12 : 20 }} className="flex-row items-center justify-between">
                            <Text style={{ fontSize: bannerSubSize }} className="font-lufga text-slate-300">
                                {items.length} saved products
                            </Text>
                            <Text style={{ fontSize: isTiny ? 15 : 18 }} className="font-lufga-bold text-amber-300">
                                Rs {total.toLocaleString()}
                            </Text>
                        </View>
                        <Pressable
                            style={{ marginTop: isTiny ? 12 : 20, paddingHorizontal: isTiny ? 12 : 16, paddingVertical: isTiny ? 10 : 12 }}
                            className="flex-row items-center justify-between rounded-2xl bg-white/10 active:bg-white/20"
                            onPress={openAutoOrderPicker}
                            disabled={updateCard.isPending}
                        >
                            <View className="flex-1 flex-row items-center">
                                <Calendar size={isTiny ? 15 : 18} color="#FCD34D" />
                                <View style={{ marginLeft: isTiny ? 8 : 12 }} className="flex-1">
                                    <Text style={{ fontSize: isTiny ? 12 : 14 }} className="font-lufga-semibold text-white">
                                        Auto-order
                                    </Text>
                                    <Text style={{ fontSize: isTiny ? 10 : 12, marginTop: 2 }} className="font-lufga text-slate-300" numberOfLines={1}>
                                        {autoOrderDate ? `Next order: ${autoOrderLabel}` : 'Choose your next order date'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: isTiny ? 11 : 13, marginLeft: 8 }} className="font-lufga-semibold text-amber-300" numberOfLines={1}>
                                {autoOrderLabel}
                            </Text>
                        </Pressable>
                    </View>

                    {/* ── Products section header ── */}
                    <View
                        style={{ paddingHorizontal: pad, marginTop: isTiny ? 18 : 24, marginBottom: isTiny ? 10 : 12 }}
                        className="flex-row items-center justify-between"
                    >
                        <Text style={{ fontSize: sectionTitleSize }} className="font-lufga-bold text-slate-950">
                            Products
                        </Text>
                        <GradientPill style={{ height: isTiny ? 36 : 40 }} className="rounded-full">
                            <Pressable
                                style={{ paddingHorizontal: isTiny ? 12 : 16 }}
                                className="flex-1 flex-row items-center active:opacity-80"
                                onPress={onGoToCart}
                            >
                                <Plus size={isTiny ? 13 : 15} color="#171717" strokeWidth={2.8} />
                                <Text style={{ fontSize: isTiny ? 11 : 13, marginLeft: 6 }} className="font-lufga-bold text-slate-950">
                                    Add from Cart
                                </Text>
                            </Pressable>
                        </GradientPill>
                    </View>

                    {/* ── Empty state ── */}
                    {items.length === 0 ? (
                        <View
                            style={{ marginHorizontal: pad, paddingHorizontal: isTiny ? 16 : 24, paddingVertical: isTiny ? 28 : 40 }}
                            className="items-center rounded-[28px] bg-white"
                        >
                            <PackageOpen size={isTiny ? 28 : 36} color="#b77900" />
                            <Text style={{ fontSize: isTiny ? 15 : 18, marginTop: 16 }} className="font-lufga-bold text-slate-950">
                                This list is empty
                            </Text>
                            <Text style={{ fontSize: isTiny ? 11 : 13, marginTop: 8, lineHeight: isTiny ? 16 : 20 }} className="text-center font-lufga text-slate-500">
                                Open your Cart and use "Add to Monthly Grocery" on Grocery products.
                            </Text>
                            <Pressable
                                style={{ marginTop: isTiny ? 16 : 20, paddingHorizontal: isTiny ? 18 : 24, paddingVertical: isTiny ? 10 : 12 }}
                                className="rounded-full bg-[#FFC400]"
                                onPress={onGoToCart}
                            >
                                <Text style={{ fontSize: isTiny ? 12 : 14 }} className="font-lufga-bold text-slate-950">
                                    Go to Cart
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={{ gap: isTiny ? 10 : 12, paddingHorizontal: pad, paddingBottom: 40 }}>
                            {items.map((item) => {
                                const product = item.product_id;
                                if (!product) return null;
                                const imageUri = getMonthlyProductImage(product);
                                const price = Number(product.final_price ?? product.price ?? 0);
                                return (
                                    <View key={item._id} style={{ padding: isTiny ? 10 : 12 }} className="rounded-3xl bg-white">
                                        <View className="flex-row items-center">
                                            {/* Thumbnail */}
                                            <View
                                                style={{ height: thumbSize, width: thumbSize }}
                                                className="items-center justify-center overflow-hidden rounded-2xl bg-slate-100"
                                            >
                                                {imageUri ? (
                                                    <Image
                                                        source={{ uri: imageUri }}
                                                        style={{ width: thumbSize, height: thumbSize }}
                                                        resizeMode="contain"
                                                    />
                                                ) : (
                                                    <Text style={{ fontSize: isTiny ? 20 : 24 }}>🛒</Text>
                                                )}
                                            </View>

                                            {/* Info */}
                                            <View style={{ marginLeft: isTiny ? 10 : 12 }} className="flex-1">
                                                <Text style={{ fontSize: productTitleSize }} className="font-lufga-semibold text-slate-900" numberOfLines={1}>
                                                    {product.title}
                                                </Text>
                                                <Text style={{ fontSize: isTiny ? 10 : 12, marginTop: 2 }} className="font-lufga text-slate-400" numberOfLines={1}>
                                                    {product.business_id?.name || 'Grocery Provider'}
                                                </Text>
                                                {item.variant?.name && (
                                                    <Text style={{ fontSize: isTiny ? 10 : 12, marginTop: 4 }} className="font-lufga-medium text-amber-700" numberOfLines={1}>
                                                        {item.variant.name}
                                                    </Text>
                                                )}
                                                <Text style={{ fontSize: productPriceSize, marginTop: isTiny ? 6 : 8 }} className="font-lufga-semibold text-slate-900">
                                                    Rs {((item.variant?.price || price) * item.quantity).toLocaleString()}
                                                </Text>
                                            </View>

                                            {/* Controls */}
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
                                                        disabled={item.quantity <= 1}
                                                        style={{ height: qtyBtnSize, width: qtyBtnSize }}
                                                        className="items-center justify-center rounded-full bg-white disabled:opacity-40"
                                                        onPress={() => updateItem.mutate({ cardId: card._id, itemId: item._id, updates: { quantity: item.quantity - 1 } })}
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
                                                        onPress={() => updateItem.mutate({ cardId: card._id, itemId: item._id, updates: { quantity: item.quantity + 1 } })}
                                                    >
                                                        <Plus size={qtyIconSize} color="#111827" strokeWidth={2.5} />
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                    <View className="h-8" />
                </ScrollView>
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
                                <Text style={{ fontSize: isTiny ? 18 : 22 }} className="font-lufga-bold text-slate-950">Choose Address</Text>
                                <Text style={{ fontSize: isTiny ? 11 : 13, marginTop: 4 }} className="font-lufga text-slate-400">Select a saved delivery address</Text>
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

            {/* ── Auto-order date picker modal ── */}
            {showAutoOrderPicker && (
                <Modal
                    visible
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowAutoOrderPicker(false)}
                >
                    <Pressable
                        style={{ paddingHorizontal: pad }}
                        className="flex-1 items-center justify-center bg-black/45"
                        onPress={() => setShowAutoOrderPicker(false)}
                    >
                        <Pressable
                            style={{ padding: isTiny ? 16 : 20 }}
                            className="w-full rounded-3xl bg-white"
                            onPress={(event) => event.stopPropagation()}
                        >
                            <Text style={{ fontSize: isTiny ? 17 : 20 }} className="font-lufga-bold text-slate-950">Choose auto-order date</Text>
                            <Text style={{ fontSize: isTiny ? 11 : 13, marginTop: 4 }} className="font-lufga text-slate-500">Select the date for the next order.</Text>
                            <View style={{ marginTop: isTiny ? 12 : 16 }}>
                                <DateTimePicker
                                    mode="single"
                                    date={draftAutoOrderDate || new Date()}
                                    minDate={new Date()}
                                    onChange={handleAutoOrderDate}
                                    styles={calendarStyles}
                                />
                            </View>
                            <Pressable
                                style={{ marginTop: isTiny ? 12 : 16, paddingVertical: isTiny ? 12 : 16 }}
                                className="items-center justify-center rounded-full bg-[#EAB308] active:opacity-80"
                                onPress={saveAutoOrderDate}
                                disabled={!draftAutoOrderDate || updateCard.isPending}
                            >
                                <Text style={{ fontSize: isTiny ? 13 : 15 }} className="font-lufga-bold text-slate-950">Save date</Text>
                            </Pressable>
                        </Pressable>
                    </Pressable>
                </Modal>
            )}
        </AppBackground>
    );
}
