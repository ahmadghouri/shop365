import { Text, View } from 'react-native';

type VendorSummary = {
    name: string;
    subtotal: number;
    deliveryFee: number;
    minimumOrder: number;
};

type Props = {
    vendorSummaries: VendorSummary[];
    total: number;
};

/** Per-vendor subtotals/delivery/minimum + grand total. */
export function CartOrderSummary({ vendorSummaries, total }: Props) {
    return (
        <View className="mx-5 mt-6 rounded-3xl bg-white/85 p-4">
            <Text className="mb-3 text-base font-lufga-semibold text-slate-900">Order Summary</Text>

            {vendorSummaries.map((v) => (
                <View key={v.name} className="mb-3 rounded-2xl bg-slate-50 p-3">
                    <Text className="mb-1 text-sm font-lufga-bold text-slate-900">{v.name}</Text>
                    <View className="flex-row justify-between py-0.5">
                        <Text className="text-sm font-lufga text-slate-500">Subtotal</Text>
                        <Text className="text-sm font-lufga-medium text-slate-800">
                            Rs {v.subtotal.toLocaleString()}
                        </Text>
                    </View>
                    {v.deliveryFee > 0 && (
                        <View className="flex-row justify-between py-0.5">
                            <Text className="text-sm font-lufga text-slate-500">Delivery Fee</Text>
                            <Text className="text-sm font-lufga-medium text-slate-800">
                                Rs {v.deliveryFee.toLocaleString()}
                            </Text>
                        </View>
                    )}
                    {v.minimumOrder > 0 && (
                        <Text className="mt-1 text-xs font-lufga text-amber-700">
                            {v.subtotal >= v.minimumOrder
                                ? `Minimum order met (Rs ${v.minimumOrder.toLocaleString()})`
                                : `Minimum order Rs ${v.minimumOrder.toLocaleString()} — add Rs ${(v.minimumOrder - v.subtotal).toLocaleString()} more`}
                        </Text>
                    )}
                </View>
            ))}

            <View className="mt-2 flex-row justify-between border-t border-slate-100 pt-3">
                <Text className="text-base font-lufga-semibold text-slate-900">Total</Text>
                <Text className="text-lg font-lufga-bold text-slate-900">
                    Rs {total.toLocaleString()}
                </Text>
            </View>
        </View>
    );
}
