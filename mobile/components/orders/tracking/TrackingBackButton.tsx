import { Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

/** Floating back button overlaid on the tracking map. */
export function TrackingBackButton({ onBack }: { onBack?: () => void }) {
    return (
        <SafeAreaView edges={['top', 'left']} className="absolute left-0 top-0" pointerEvents="box-none">
            <Pressable
                className="ml-4 mt-2 flex-row items-center rounded-full bg-white px-4 py-2.5 active:opacity-80"
                style={{
                    shadowColor: '#0f172a',
                    shadowOpacity: 0.12,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 5,
                }}
                onPress={onBack}
            >
                <ChevronLeft size={18} color="#0f172a" />
                <Text className="ml-1 text-sm font-lufga-semibold text-slate-950">Back</Text>
            </Pressable>
        </SafeAreaView>
    );
}
