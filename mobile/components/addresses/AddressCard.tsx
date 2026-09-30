import { Pressable, Text, View } from 'react-native';
import { Check, MapPin, Pencil, Trash2 } from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import type { Address } from '@/api/addresses/address.service';

type AddressCardProps = {
    address: Address;
    onActivate: (address: Address) => void;
    onEdit: (address: Address) => void;
    onDelete: (address: Address) => void;
};

/** A single saved address row: tap left to activate, edit and delete on the right. */
export function AddressCard({ address, onActivate, onEdit, onDelete }: AddressCardProps) {
    return (
        <GlassCard
            variant="light"
            className={`rounded-2xl mb-3 ${address.is_active ? 'border-2 border-[#FCD34D]' : ''}`}
        >
            <View className="flex-row items-center px-4 py-3">
                <Pressable
                    className="flex-row flex-1 items-center"
                    onPress={() => onActivate(address)}
                >
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-50 mr-3">
                        <MapPin size={18} color="#b77900" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm font-lufga-semibold text-slate-900">
                            {address.label}
                        </Text>
                        <Text
                            className="text-xs font-lufga text-slate-400 mt-0.5"
                            numberOfLines={1}
                        >
                            {address.address}
                        </Text>
                    </View>
                    {address.is_active && <Check size={18} color="#EAB308" />}
                </Pressable>

                <Pressable
                    className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-amber-50 active:opacity-60"
                    onPress={() => onEdit(address)}
                >
                    <Pencil size={15} color="#b77900" />
                </Pressable>
                <Pressable
                    className="ml-2 h-9 w-9 items-center justify-center rounded-full bg-red-50 active:opacity-60"
                    onPress={() => onDelete(address)}
                >
                    <Trash2 size={15} color="#ef4444" />
                </Pressable>
            </View>
        </GlassCard>
    );
}
