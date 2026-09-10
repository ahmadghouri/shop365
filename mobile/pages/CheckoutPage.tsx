import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Upload } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GradientPill } from '@/components/reusable/GradientPill';
import { useAddresses } from '@/api/addresses/useAddressQueries';
import { useCartStore } from '@/lib/cartStore';
import { placeOrder } from '@/api/orders/order.service';
import type { Address } from '@/api/addresses/address.service';

// ponytail: payment details hardcoded — move to admin config when backend supports it
const PAYMENT_METHODS = [
    {
        id: 'jazzcash',
        logo: require('@/assets/Google.png'), // replace with JazzCash logo asset
        title: 'Muhammad Abbas',
        account: '03276691880',
        name: 'JazzCash',
    },
    {
        id: 'meezan',
        logo: require('@/assets/Google.png'), // replace with Meezan logo asset
        title: 'Muhammad Abbas',
        account: '57010112760130',
        name: 'Meezan Bank',
    },
];

type CheckoutPageProps = {
    onBack?: () => void;
    onSuccess?: () => void;
    excludeVendorIds?: string[];
};

export function CheckoutPage({ onBack, onSuccess, excludeVendorIds = [] }: CheckoutPageProps) {
    const { data: addresses = [] } = useAddresses();
    const { getVendorSummaries, loadCart } = useCartStore();

    const [selectedAddressId, setSelectedAddressId] = useState<string>(
        addresses.find((a) => a.is_active)?._id || addresses[0]?._id || ''
    );
    const [screenshotUri, setScreenshotUri] = useState('');
    const [placing, setPlacing] = useState(false);

    const excludeSet = new Set(excludeVendorIds);
    const vendorSummaries = getVendorSummaries().filter((v) => !excludeSet.has(v.businessId));
    const subtotal = vendorSummaries.reduce((sum, v) => sum + v.subtotal, 0);
    const delivery = vendorSummaries.reduce((sum, v) => sum + v.deliveryFee, 0);
    const discount = 0;
    const payable = subtotal + delivery - discount;

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            Alert.alert('Select address', 'Please select a delivery address.');
            return;
        }
        setPlacing(true);
        try {
            await placeOrder({
                address_id: selectedAddressId,
                excluded_business_ids: excludeSet.size > 0 ? [...excludeSet] : undefined,
            });
            await loadCart();
            Alert.alert('Order Placed! 🎉', 'Your order has been placed successfully.', [
                { text: 'OK', onPress: onSuccess },
            ]);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || err?.message || 'Could not place order. Please try again.');
        } finally {
            setPlacing(false);
        }
    };

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header */}
                <View className="flex-row items-center px-5 pt-2 pb-4">
                    <Pressable
                        className="h-10 w-10 items-center justify-center rounded-full bg-white/70 active:opacity-60 mr-3"
                        onPress={onBack}
                    >
                        <ChevronLeft size={22} color="#1e293b" />
                    </Pressable>
                    <Text className="text-2xl font-lufga-bold text-slate-900">Checkout</Text>
                </View>

                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>

                    {/* Delivery Addresses */}
                    {addresses.length > 0 && (
                        <View className="mb-5">
                            {addresses.map((addr: Address) => {
                                const selected = addr._id === selectedAddressId;
                                return (
                                    <Pressable
                                        key={addr._id}
                                        onPress={() => setSelectedAddressId(addr._id)}
                                        className={`mb-3 rounded-2xl bg-white px-4 py-3 flex-row items-center justify-between border ${selected ? 'border-[#EAB308]' : 'border-slate-100'}`}
                                    >
                                        <View className="flex-1">
                                            <Text className="text-sm font-lufga-semibold text-slate-900">{addr.label}</Text>
                                            <Text className="text-xs font-lufga text-slate-400 mt-0.5" numberOfLines={1}>{addr.address}</Text>
                                        </View>
                                        <View className={`h-4 w-4 rounded-full border-2 ml-3 ${selected ? 'border-[#EAB308] bg-[#EAB308]' : 'border-slate-300'}`} />
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}

                    {/* Payment Method */}
                    <Text className="text-base font-lufga-semibold text-slate-900 mb-3">Payment Method</Text>
                    <View className="bg-white rounded-2xl px-4 py-3 mb-3">
                        {PAYMENT_METHODS.map((pm, i) => (
                            <View
                                key={pm.id}
                                className={`flex-row items-center py-3 ${i < PAYMENT_METHODS.length - 1 ? 'border-b border-slate-100' : ''}`}
                            >
                                <Image
                                    source={pm.logo}
                                    style={{ width: 48, height: 48 }}
                                    resizeMode="contain"
                                />
                                <View className="ml-3">
                                    <Text className="text-xs font-lufga text-slate-500">
                                        Account Title: <Text className="font-lufga-bold text-slate-900">{pm.title}</Text>
                                    </Text>
                                    <Text className="text-xs font-lufga text-slate-500 mt-0.5">
                                        Account No: <Text className="font-lufga-bold text-slate-900">{pm.account}</Text>
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Note */}
                    <Text className="text-xs font-lufga text-slate-400 mb-4 leading-5">
                        For online payments (JazzCash/Bank Transfer), please upload a screenshot as proof of payment. For COD orders, payment will be collected upon delivery.
                    </Text>

                    {/* Upload Screenshot */}
                    <Text className="text-sm font-lufga-semibold text-slate-700 mb-2">
                        Upload Payment Screenshot <Text className="font-lufga text-slate-400">(Optional)</Text>
                    </Text>
                    <View className="flex-row items-center bg-white rounded-2xl border border-slate-100 overflow-hidden mb-6">
                        <TextInput
                            className="flex-1 px-4 py-3 text-sm font-lufga text-slate-400"
                            value={screenshotUri}
                            placeholder=""
                            editable={false}
                        />
                        <Pressable className="bg-slate-900 px-5 py-3 flex-row items-center active:opacity-80">
                            <Upload size={15} color="#fff" />
                            <Text className="ml-2 text-sm font-lufga-semibold text-white">Upload</Text>
                        </Pressable>
                    </View>

                    {/* Order Summary */}
                    <View className="mb-6 border-t border-slate-100 pt-4">
                        <Text className="mb-2 text-sm font-lufga-semibold text-slate-900">Order Summary</Text>
                        {vendorSummaries.map((v) => (
                            <View key={v.name} className="mb-3 rounded-xl bg-slate-50 p-3">
                                <Text className="mb-1 text-sm font-lufga-bold text-slate-900">{v.name}</Text>
                                <View className="flex-row justify-between mb-1">
                                    <Text className="text-sm font-lufga text-slate-500">Subtotal</Text>
                                    <Text className="text-sm font-lufga-semibold text-slate-900">RS: {v.subtotal.toLocaleString()}</Text>
                                </View>
                                {v.deliveryFee > 0 && (
                                    <View className="flex-row justify-between mb-1">
                                        <Text className="text-sm font-lufga text-slate-500">Delivery Charges</Text>
                                        <Text className="text-sm font-lufga-semibold text-slate-900">RS: {v.deliveryFee}</Text>
                                    </View>
                                )}
                                {v.minimumOrder > 0 && (
                                    <Text className="text-xs font-lufga text-amber-700">
                                        {v.subtotal >= v.minimumOrder
                                            ? `Minimum order met (Rs ${v.minimumOrder.toLocaleString()})`
                                            : `Minimum order Rs ${v.minimumOrder.toLocaleString()} — add Rs ${(v.minimumOrder - v.subtotal).toLocaleString()} more`}
                                    </Text>
                                )}
                            </View>
                        ))}
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-sm font-lufga text-slate-500">Discount:</Text>
                            <Text className="text-sm font-lufga-semibold text-slate-900">RS: {discount}</Text>
                        </View>
                        <View className="flex-row justify-between mt-1">
                            <Text className="text-sm font-lufga-semibold text-slate-900">Payable Amount:</Text>
                            <Text className="text-sm font-lufga-bold text-slate-900">RS: {payable.toLocaleString()}</Text>
                        </View>
                    </View>

                    <View className="h-6" />
                </ScrollView>

                {/* Place Order */}
                <View className="px-5 pb-6 pt-3 border-t border-slate-100 bg-white/80">
                    <GradientPill className="rounded-full h-14">
                        <Pressable
                            className="flex-1 items-center justify-center active:opacity-80"
                            disabled={placing}
                            onPress={handlePlaceOrder}
                        >
                            <Text className="text-base font-lufga-bold text-slate-900">
                                {placing ? 'Placing Order...' : 'Place Order'}
                            </Text>
                        </Pressable>
                    </GradientPill>
                </View>
            </SafeAreaView>
        </AppBackground>
    );
}
