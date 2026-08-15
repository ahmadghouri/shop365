import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { GradientPill } from '@/components/reusable/GradientPill';

type VendorGroup = {
    business_id: string;
    business_name: string;
    min_order_price: number;
    subtotal: number;
};

type Props = {
    visible: boolean;
    vendors: VendorGroup[];
    onClose: () => void;
    onCheckoutWithoutVendors: () => void;
};

export function VendorMinOrderModal({ visible, vendors, onClose, onCheckoutWithoutVendors }: Props) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 items-center justify-center bg-black/40 px-6">
                <View className="w-full max-w-md rounded-2xl bg-white p-4">
                    <Text className="mb-2 text-lg font-lufga-semibold text-slate-900">Minimum order not met</Text>
                    <Text className="mb-3 text-sm font-lufga text-slate-600">The following vendor(s) have minimum order requirements that aren't met:</Text>

                    <ScrollView className="max-h-40 mb-3">
                        {vendors.map((g) => (
                            <View key={g.business_id} className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
                                <Text className="text-sm font-lufga-semibold text-slate-800">{g.business_name}</Text>
                                <Text className="text-xs font-lufga text-slate-500">Min order: Rs {g.min_order_price.toLocaleString()}</Text>
                                <Text className="text-xs font-lufga text-amber-600">Add Rs {(g.min_order_price - g.subtotal).toLocaleString()} more.</Text>
                            </View>
                        ))}
                    </ScrollView>

                    <View className="mt-2">
                        <GradientPill className="w-full rounded-full h-14">
                            <Pressable className="h-14 w-full items-center justify-center rounded-full" onPress={onCheckoutWithoutVendors}>
                                <Text className="text-base font-lufga-semibold text-slate-900">Checkout without these items</Text>
                            </Pressable>
                        </GradientPill>
                    </View>

                    <View className="mt-3">
                        <Pressable onPress={onClose} className="w-full items-center justify-center rounded-lg bg-white px-3 py-3 active:opacity-70">
                            <Text className="text-sm font-lufga text-slate-600">Close</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default VendorMinOrderModal;
