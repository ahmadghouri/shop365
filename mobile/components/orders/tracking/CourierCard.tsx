import { Image, Linking, Pressable, Text, View } from 'react-native';
import { Bike, MessageCircle, Phone } from 'lucide-react-native';
import { GradientPill } from '@/components/reusable/GradientPill';
import { ACCENT } from './trackingConstants';

type CourierCardProps = {
    partnerName: string;
    riderPhone?: string | null;
    riderImage?: string | null;
};

/** The courier row: rider avatar/name plus call and message actions. */
export function CourierCard({ partnerName, riderPhone, riderImage }: CourierCardProps) {
    return (
        <View className="mt-4 mb-2 flex-row items-center rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-amber-50">
                {riderImage ? (
                    <Image source={{ uri: riderImage }} className="h-12 w-12" resizeMode="cover" />
                ) : (
                    <Bike size={20} color="#b77900" />
                )}
            </View>

            <View className="ml-3 flex-1 min-w-0">
                <Text
                    className="text-sm font-lufga-bold text-slate-950"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {partnerName}
                </Text>
                <Text className="text-xs font-lufga text-slate-400">Courier</Text>
            </View>

            {/* Call */}
            <Pressable
                className="active:opacity-70"
                disabled={!riderPhone}
                onPress={() => (riderPhone ? Linking.openURL(`tel:${riderPhone}`) : undefined)}
            >
                <GradientPill className={`h-12 w-12 rounded-full ${riderPhone ? '' : 'opacity-50'}`}>
                    <View className="flex-1 items-center justify-center">
                        <Phone size={19} color="#171717" />
                    </View>
                </GradientPill>
            </Pressable>

            {/* Message */}
            <Pressable className="relative ml-2 h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white active:opacity-70">
                <MessageCircle size={19} color="#0f172a" />
                <View
                    className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-white"
                    style={{ backgroundColor: ACCENT }}
                />
            </Pressable>
        </View>
    );
}
