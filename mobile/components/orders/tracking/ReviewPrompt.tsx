import { Pressable, Text, View } from 'react-native';
import { GradientPill } from '@/components/reusable/GradientPill';

type ReviewPromptProps = {
    canReview: boolean;
    alreadyReviewed: boolean;
    onPress: () => void;
};

/** The "Rate your experience" CTA (or a thank-you) shown after delivery. */
export function ReviewPrompt({ canReview, alreadyReviewed, onPress }: ReviewPromptProps) {
    if (canReview) {
        return (
            <Pressable className="mt-3 active:opacity-80" onPress={onPress}>
                <GradientPill className="h-12 rounded-full">
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-base font-lufga-bold text-slate-950">
                            Rate your experience
                        </Text>
                    </View>
                </GradientPill>
            </Pressable>
        );
    }
    if (alreadyReviewed) {
        return (
            <Text className="mt-3 text-center text-sm font-lufga text-emerald-600">
                Thanks for your feedback!
            </Text>
        );
    }
    return null;
}
