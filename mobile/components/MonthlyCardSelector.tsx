import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Check, ChevronDown, Plus, ShoppingBasket, X } from 'lucide-react-native';
import type { MonthlyGroceryCard } from '@/api/monthly-grocery/monthly-grocery.service';

type MonthlyCardSelectorProps = {
    cards: MonthlyGroceryCard[];
    selectedCardId: string;
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
    onSelect: (cardId: string) => void;
    onCreate: () => void;
};

export function MonthlyCardSelector({
    cards,
    selectedCardId,
    open,
    onOpen,
    onClose,
    onSelect,
    onCreate,
}: MonthlyCardSelectorProps) {
    const selected = cards.find((card) => card._id === selectedCardId);

    return (
        <>
            <Pressable
                className="mt-3 flex-row items-center rounded-2xl border border-amber-200 bg-white px-4 py-3 active:opacity-70"
                onPress={onOpen}
            >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                    <ShoppingBasket size={18} color="#b45309" />
                </View>
                <View className="ml-3 flex-1">
                    <Text className="text-xs font-lufga text-slate-400">Add products to</Text>
                    <Text className="mt-0.5 font-lufga-semibold text-slate-900" numberOfLines={1}>
                        {selected?.name || 'Select a grocery card'}
                    </Text>
                </View>
                <ChevronDown size={19} color="#64748b" />
            </Pressable>

            <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
                <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
                    <Pressable className="max-h-[70%] rounded-t-[30px] bg-white px-5 pb-8 pt-4" onPress={() => { }}>
                        <View className="mb-4 flex-row items-center justify-between">
                            <View>
                                <Text className="text-xl font-lufga-bold text-slate-900">Choose a card</Text>
                                <Text className="mt-1 text-sm font-lufga text-slate-400">Select where this product should be saved</Text>
                            </View>
                            <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-slate-100" onPress={onClose}>
                                <X size={18} color="#334155" />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {cards.map((card) => {
                                const active = card._id === selectedCardId;
                                return (
                                    <Pressable
                                        key={card._id}
                                        className={`mb-2 flex-row items-center rounded-2xl border p-4 ${active ? 'border-amber-400 bg-amber-50' : 'border-slate-100 bg-slate-50'
                                            }`}
                                        onPress={() => {
                                            onSelect(card._id);
                                            onClose();
                                        }}
                                    >
                                        <View className={`h-10 w-10 items-center justify-center rounded-full ${active ? 'bg-amber-400' : 'bg-white'}`}>
                                            <ShoppingBasket size={19} color={active ? '#0f172a' : '#64748b'} />
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <Text className="font-lufga-semibold text-slate-900">{card.name}</Text>
                                            <Text className="mt-0.5 text-xs font-lufga text-slate-400">
                                                {card.items.length} {card.items.length === 1 ? 'item' : 'items'}
                                            </Text>
                                        </View>
                                        {active && <Check size={20} color="#b45309" />}
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        <Pressable
                            className="mt-3 flex-row items-center justify-center rounded-full bg-[#EAB308] py-4 active:opacity-80"
                            onPress={() => {
                                onClose();
                                onCreate();
                            }}
                        >
                            <Plus size={19} color="#0f172a" />
                            <Text className="ml-2 font-lufga-semibold text-slate-900">Create New Card</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}