import { View, Text, Pressable } from 'react-native';
import { Check, Plus } from 'lucide-react-native';

export type Extra = {
    id: string;
    name: string;
    price: number;
};

type ExtrasListProps = {
    title?: string;
    extras: Extra[];
    selectedIds: string[];
    onToggle: (extraId: string) => void;
};

export function ExtrasList({ title = 'Add extra items', extras, selectedIds, onToggle }: ExtrasListProps) {
    if (extras.length === 0) return null;

    return (
        <View className="mt-6">
            <Text className="text-base font-lufga-semibold text-slate-900">{title}</Text>

            <View className="mt-3 gap-2">
                {extras.map((extra) => {
                    const isSelected = selectedIds.includes(extra.id);

                    return (
                        <Pressable
                            key={extra.id}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: isSelected }}
                            className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 active:opacity-80 ${isSelected ? 'border-[#EAB308] bg-[#FFFBEB]' : 'border-slate-200 bg-white/70'
                                }`}
                            onPress={() => onToggle(extra.id)}
                        >
                            <View className="flex-1 flex-row items-center">
                                <View
                                    className={`h-6 w-6 items-center justify-center rounded-full ${isSelected ? 'bg-[#EAB308]' : 'bg-slate-100'
                                        }`}
                                >
                                    {isSelected ? (
                                        <Check size={14} color="#111827" strokeWidth={3} />
                                    ) : (
                                        <Plus size={14} color="#94a3b8" strokeWidth={3} />
                                    )}
                                </View>

                                <Text className="ml-3 flex-1 text-[15px] font-lufga text-slate-800" numberOfLines={1}>
                                    {extra.name}
                                </Text>
                            </View>

                            <Text className="ml-3 text-[15px] font-lufga-medium text-slate-900">
                                + {extra.price}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}
