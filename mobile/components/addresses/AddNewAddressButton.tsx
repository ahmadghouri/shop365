import { Pressable, Text } from 'react-native';
import { Plus } from 'lucide-react-native';
import { GradientPill } from '@/components/reusable/GradientPill';

type AddNewAddressButtonProps = {
    onPress: () => void;
};

/** Gradient "Add New Address" button. */
export function AddNewAddressButton({ onPress }: AddNewAddressButtonProps) {
    return (
        <GradientPill className="rounded-full h-12 mt-2">
            <Pressable
                className="flex-1 flex-row items-center justify-center px-4 active:opacity-80"
                onPress={onPress}
            >
                <Plus size={16} color="#111827" />
                <Text
                    className="ml-2 text-sm font-lufga-semibold text-slate-900"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    Add New Address
                </Text>
            </Pressable>
        </GradientPill>
    );
}
