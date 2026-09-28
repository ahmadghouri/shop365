import { Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

/** Floating back button overlaid on the tracking map. */
export function TrackingBackButton({ onBack }: { onBack?: () => void }) {
    return (
        <SafeAreaView edges={['top', 'left']} className="absolute left-0 top-0" pointerEvents="box-none">
            <Pressable
                className="ml-4 mt-2 flex-row items-center rounded-full bg-[#141414] px-4 py-2.5 active:opacity-80"
                style={{
                    shadowColor: '#000',
                    shadowOpacity: 0.2,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 5,
                }}
                onPress={onBack}
            >
                <ChevronLeft size={18} color="#fff" />
                <Text className="ml-1 text-sm font-lufga-semibold text-white">Back</Text>
            </Pressable>
        </SafeAreaView>
    );
}
