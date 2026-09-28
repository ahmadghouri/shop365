import { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { X } from 'lucide-react-native';
import { GradientPill } from '@/components/reusable/GradientPill';
import { StarRating } from '@/components/orders/StarRating';
import { submitReview, submitRiderReview } from '@/api/reviews/review.service';

type ReviewModalProps = {
    visible: boolean;
    orderId: string;
    /** Vendor to review (null if it can't be determined). */
    businessId?: string | null;
    /** Rider to review (null if the order had no rider). */
    riderName?: string | null;
    riderImage?: string | null;
    hasRider?: boolean;
    onClose: () => void;
    onSubmitted?: () => void;
};

/** After delivery: rate the order/vendor and (if present) the rider. */
export function ReviewModal({
    visible,
    orderId,
    businessId,
    riderName,
    riderImage,
    hasRider,
    onClose,
    onSubmitted,
}: ReviewModalProps) {
    const [orderRating, setOrderRating] = useState(0);
    const [orderComment, setOrderComment] = useState('');
    const [riderRating, setRiderRating] = useState(0);
    const [riderComment, setRiderComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (businessId && orderRating < 1) {
            Alert.alert('Rate your order', 'Please tap the stars to rate your order.');
            return;
        }
        if (businessId && !orderComment.trim()) {
            Alert.alert('Add a comment', 'Please write a short comment about your order.');
            return;
        }
        if (hasRider && riderRating < 1) {
            Alert.alert('Rate your rider', 'Please tap the stars to rate your rider.');
            return;
        }

        setSubmitting(true);
        try {
            // Vendor/order review (needs a comment per backend).
            if (businessId) {
                await submitReview({
                    business_id: businessId,
                    order_id: orderId,
                    rating: orderRating,
                    comments: orderComment.trim(),
                });
            }
            // Rider review (comment optional).
            if (hasRider) {
                await submitRiderReview({
                    order_id: orderId,
                    rating: riderRating,
                    comments: riderComment.trim(),
                });
            }
            onSubmitted?.();
            onClose();
            Alert.alert('Thank you!', 'Your feedback has been submitted.');
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                'Could not submit your review. Please try again.';
            Alert.alert('Review failed', msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 items-center justify-center bg-black/50 px-6">
                <View className="max-h-[85%] w-full max-w-md rounded-3xl bg-white p-6">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-xl font-lufga-bold text-slate-900">
                            Rate your experience
                        </Text>
                        <Pressable onPress={onClose} className="p-1 active:opacity-60">
                            <X size={20} color="#64748b" />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="mt-2">
                        {/* Order / vendor */}
                        {businessId ? (
                            <View className="mt-3">
                                <Text className="text-sm font-lufga-semibold text-slate-900">
                                    How was your order?
                                </Text>
                                <View className="mt-3">
                                    <StarRating value={orderRating} onChange={setOrderRating} />
                                </View>
                                <TextInput
                                    value={orderComment}
                                    onChangeText={setOrderComment}
                                    placeholder="Tell us about the food/order…"
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    className="mt-3 min-h-16 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-lufga text-slate-900"
                                    style={{ textAlignVertical: 'top' }}
                                />
                            </View>
                        ) : null}

                        {/* Rider */}
                        {hasRider ? (
                            <View className="mt-5 border-t border-slate-100 pt-4">
                                <View className="flex-row items-center">
                                    <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                                        {riderImage ? (
                                            <Image
                                                source={{ uri: riderImage }}
                                                className="h-10 w-10"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <Text className="text-xs font-lufga text-slate-400">
                                                {(riderName?.[0] ?? 'R').toUpperCase()}
                                            </Text>
                                        )}
                                    </View>
                                    <View className="ml-2">
                                        <Text className="text-sm font-lufga-semibold text-slate-900">
                                            Rate your rider
                                        </Text>
                                        <Text className="text-xs font-lufga text-slate-500">
                                            {riderName || 'Delivery rider'}
                                        </Text>
                                    </View>
                                </View>
                                <View className="mt-3">
                                    <StarRating value={riderRating} onChange={setRiderRating} />
                                </View>
                                <TextInput
                                    value={riderComment}
                                    onChangeText={setRiderComment}
                                    placeholder="How was the delivery? (optional)"
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    className="mt-3 min-h-16 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-lufga text-slate-900"
                                    style={{ textAlignVertical: 'top' }}
                                />
                            </View>
                        ) : null}

                        <GradientPill
                            className="mt-5 h-12 rounded-full"
                            style={{ opacity: submitting ? 0.6 : 1 }}
                        >
                            <Pressable
                                className="flex-1 items-center justify-center"
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                <Text className="text-base font-lufga-bold text-slate-950">
                                    {submitting ? 'Submitting…' : 'Submit Feedback'}
                                </Text>
                            </Pressable>
                        </GradientPill>

                        <Pressable
                            onPress={onClose}
                            className="mt-3 items-center py-1 active:opacity-70"
                        >
                            <Text className="text-sm font-lufga text-slate-400">Maybe later</Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
