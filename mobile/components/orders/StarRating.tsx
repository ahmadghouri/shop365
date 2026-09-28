import { Pressable, View } from 'react-native';
import { Star } from 'lucide-react-native';

type StarRatingProps = {
    value: number;
    onChange: (n: number) => void;
    size?: number;
};

/** Tappable 1–5 star row. */
export function StarRating({ value, onChange, size = 32 }: StarRatingProps) {
    return (
        <View className="flex-row justify-center">
            {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => onChange(n)} className="px-1.5 active:opacity-70">
                    <Star size={size} color="#EAB308" fill={n <= value ? '#EAB308' : 'transparent'} />
                </Pressable>
            ))}
        </View>
    );
}
