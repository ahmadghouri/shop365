import { Modal, Pressable, Text, View } from 'react-native';
import { Check, ShoppingBag } from 'lucide-react-native';
import { GradientPill } from '@/components/reusable/GradientPill';

type OrderSuccessModalProps = {
    visible: boolean;
    /** Primary action — usually navigate to order history / tracking. */
    onViewOrders: () => void;
    /** Secondary action — continue shopping / close. */
    onContinue: () => void;
};

/** A friendly "order placed" confirmation shown after checkout. */
export function OrderSuccessModal({ visible, onViewOrders, onContinue }: OrderSuccessModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
            <View className="flex-1 items-center justify-center bg-black/50 px-8">
                <View className="w-full items-center rounded-3xl bg-white px-6 pb-6 pt-8">
                    {/* Success check */}
                    <View className="h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                        <View className="h-14 w-14 items-center justify-center rounded-full bg-emerald-500">
                            <Check size={30} color="#ffffff" />
                        </View>
                    </View>

                    <Text className="mt-5 text-xl font-lufga-bold text-slate-900">
                        Order Placed!
                    </Text>
                    <Text className="mt-2 text-center text-sm font-lufga text-slate-500 leading-5">
                        Your order has been placed successfully and is being prepared.
                        You can track it from your orders.
                    </Text>

                    {/* Primary: view orders */}
                    <View className="mt-6 w-full">
                        <GradientPill className="rounded-full h-12">
                            <Pressable
                                className="flex-1 flex-row items-center justify-center active:opacity-80"
                                onPress={onViewOrders}
                            >
                                <ShoppingBag size={16} color="#111827" />
                                <Text className="ml-2 text-sm font-lufga-semibold text-slate-900">
                                    View My Orders
                                </Text>
                            </Pressable>
                        </GradientPill>
                    </View>

                    {/* Secondary: continue */}
                    <Pressable
                        className="mt-3 w-full items-center justify-center rounded-full border border-slate-200 py-3 active:opacity-70"
                        onPress={onContinue}
                    >
                        <Text className="text-sm font-lufga-semibold text-slate-600">
                            Continue Shopping
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
