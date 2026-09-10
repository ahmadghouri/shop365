import { Image, Linking, Pressable, Text, View } from 'react-native';
import { MessageCircle, Phone } from 'lucide-react-native';

type OrderRiderCardProps = {
    partnerName: string;
    phoneNumber?: string;
    image?: string;
};

export function OrderRiderCard({ partnerName, phoneNumber, image }: OrderRiderCardProps) {
    return (
        <View className="mt-5 flex-row items-center rounded-3xl bg-[#F7F7F5] p-4">
            {/* Avatar */}
            <View className="h-12 w-12 items-center justify-center rounded-full bg-slate-200 overflow-hidden">
                {image ? (
                    <Image source={{ uri: image }} className="h-12 w-12 rounded-full" resizeMode="cover" />
                ) : (
                    <Text className="text-xs font-lufga text-slate-500">Rider</Text>
                )}
            </View>

            <View className="ml-3 flex-1">
                <Text className="text-sm font-lufga-bold text-slate-900">{partnerName}</Text>
                <Text className="text-xs font-lufga text-slate-400">Your rider · ★ 4.9</Text>
            </View>

            {/* Call */}
            {phoneNumber && (
                <Pressable
                    className="h-11 w-11 items-center justify-center rounded-full bg-[#141414] active:opacity-70"
                    onPress={() => Linking.openURL(`tel:${phoneNumber}`)}
                >
                    <Phone size={18} color="#EAB308" />
                </Pressable>
            )}

            {/* Message */}
            <Pressable className="ml-2 h-11 w-11 items-center justify-center rounded-full bg-[#EAB308] active:opacity-70">
                <MessageCircle size={18} color="#141414" />
            </Pressable>
        </View>
    );
}
