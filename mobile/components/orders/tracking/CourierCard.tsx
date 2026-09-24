import { Image, Linking, Pressable, Text, View } from 'react-native';
import { MessageCircle, Phone } from 'lucide-react-native';
import { ACCENT } from './trackingConstants';

type CourierCardProps = {
    partnerName: string;
    riderPhone?: string | null;
    riderImage?: string | null;
};

/** The courier row: rider avatar/name plus call and message actions. */
export function CourierCard({ partnerName, riderPhone, riderImage }: CourierCardProps) {
    return (
        <View className="mt-6 mb-2 flex-row items-center rounded-3xl bg-[#1D1D1D] p-4">
            <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-700">
                {riderImage ? (
                    <Image source={{ uri: riderImage }} className="h-12 w-12" resizeMode="cover" />
                ) : (
                    <Text className="text-xs font-lufga text-slate-300">Rider</Text>
                )}
            </View>

            <View className="ml-3 flex-1 min-w-0">
                <Text
                    className="text-sm font-lufga-bold text-white"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {partnerName}
                </Text>
                <Text className="text-xs font-lufga text-slate-400">Courier</Text>
            </View>

            {/* Call */}
            <Pressable
                className="h-12 w-12 items-center justify-center rounded-full bg-white active:opacity-70"
                onPress={() => (riderPhone ? Linking.openURL(`tel:${riderPhone}`) : undefined)}
            >
                <Phone size={19} color="#141414" />
            </Pressable>

            {/* Message */}
            <Pressable className="relative ml-2 h-12 w-12 items-center justify-center rounded-full bg-white active:opacity-70">
                <MessageCircle size={19} color="#141414" />
                <View
                    className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-[#1D1D1D]"
                    style={{ backgroundColor: ACCENT }}
                />
            </Pressable>
        </View>
    );
}
