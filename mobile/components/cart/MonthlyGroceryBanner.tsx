import { Pressable, Text, View } from 'react-native';
import { Plus, ShoppingBasket } from 'lucide-react-native';
import { MonthlyCardSelector } from '@/components/MonthlyCardSelector';
import type { MonthlyGroceryCard } from '@/api/monthly-grocery/monthly-grocery.service';

type Props = {
    cards: MonthlyGroceryCard[];
    selectedCardId: string;
    showSelector: boolean;
    onOpenSelector: () => void;
    onCloseSelector: () => void;
    onSelectCard: (id: string) => void;
    onMonthlyGrocery?: () => void;
};

/** Dark "Monthly Grocery" banner with the card selector (or create prompt). */
export function MonthlyGroceryBanner({
    cards,
    selectedCardId,
    showSelector,
    onOpenSelector,
    onCloseSelector,
    onSelectCard,
    onMonthlyGrocery,
}: Props) {
    return (
        <View className="mx-5 mt-2 rounded-[28px] bg-slate-900 p-4">
            <View className="flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-amber-400">
                    <ShoppingBasket size={24} color="#0f172a" />
                </View>
                <View className="ml-3 flex-1">
                    <Text className="text-lg font-lufga-bold text-white">Monthly Grocery</Text>
                    <Text className="mt-0.5 text-xs font-lufga text-slate-300">
                        Plan your monthly essentials and keep every list organized
                    </Text>
                </View>
                <Pressable
                    className="rounded-full bg-white/10 px-3 py-2 active:opacity-60"
                    onPress={onMonthlyGrocery}
                >
                    <Text className="text-xs font-lufga-semibold text-amber-300">View</Text>
                </Pressable>
            </View>

            {cards.length > 0 ? (
                <MonthlyCardSelector
                    cards={cards}
                    selectedCardId={selectedCardId}
                    open={showSelector}
                    onOpen={onOpenSelector}
                    onClose={onCloseSelector}
                    onSelect={onSelectCard}
                    onCreate={() => onMonthlyGrocery?.()}
                />
            ) : (
                <Pressable
                    className="mt-3 flex-row items-center justify-center rounded-2xl bg-white px-4 py-3 active:opacity-70"
                    onPress={onMonthlyGrocery}
                >
                    <Plus size={18} color="#b45309" />
                    <Text className="ml-2 font-lufga-semibold text-slate-900">
                        Create your first monthly card
                    </Text>
                </Pressable>
            )}
        </View>
    );
}
