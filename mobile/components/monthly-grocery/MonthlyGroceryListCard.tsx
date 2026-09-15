import { Image, Pressable, Text, View } from 'react-native';
import { MoreHorizontal, PackageOpen, ShoppingCart } from 'lucide-react-native';
import { getMonthlyProductImage, type MonthlyGroceryCard } from '@/api/monthly-grocery/monthly-grocery.service';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';
import { cardTotal } from './cardTotal';

type MonthlyGroceryListCardProps = {
    card: MonthlyGroceryCard;
    onOpen: () => void;
    onMenu: () => void;
    onOrder: () => void;
};

export function MonthlyGroceryListCard({ card, onOpen, onMenu, onOrder }: MonthlyGroceryListCardProps) {
    const total = cardTotal(card);
    const quantity = card.items.reduce((sum, item) => sum + item.quantity, 0);
    const visibleItems = card.items.filter((item) => item.product_id).slice(0, 4);
    const remaining = Math.max(0, card.items.length - visibleItems.length);

    return (
        <GlassCard variant="light" className="rounded-[28px]">
            <View className="p-4">
                <Pressable className="flex-row items-center" onPress={onOpen}>
                    <View className="h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
                        <PackageOpen size={28} color="#b77900" strokeWidth={2.3} />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="text-lg font-lufga-bold text-slate-950" numberOfLines={1}>{card.name}</Text>
                        <Text className="mt-1 text-sm font-lufga text-slate-400">
                            {quantity} {quantity === 1 ? 'item' : 'items'} · Rs {total.toLocaleString()}
                        </Text>
                    </View>
                    <Pressable
                        className="h-9 w-9 items-center justify-center rounded-full active:bg-slate-100"
                        onPress={onMenu}
                    >
                        <MoreHorizontal size={22} color="#94a3b8" />
                    </Pressable>
                </Pressable>

                <Pressable className="mt-4 flex-row" onPress={onOpen}>
                    {visibleItems.map((item) => {
                        const uri = getMonthlyProductImage(item.product_id);
                        return (
                            <View key={item._id} className="mr-2 h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                                {uri ? <Image source={{ uri }} className="h-full w-full" resizeMode="contain" /> : <Text>🛒</Text>}
                            </View>
                        );
                    })}
                    {remaining > 0 && (
                        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                            <Text className="font-lufga-bold text-slate-500">+{remaining}</Text>
                        </View>
                    )}
                </Pressable>

                <GradientPill className="mt-4 h-12 rounded-2xl">
                    <Pressable
                        className="flex-1 flex-row items-center justify-center active:opacity-80"
                        onPress={onOrder}
                    >
                        <ShoppingCart size={18} color="#171717" strokeWidth={2.5} />
                        <Text className="ml-2 font-lufga-bold text-slate-950">
                            Order entire list · Rs {total.toLocaleString()}
                        </Text>
                    </Pressable>
                </GradientPill>
            </View>
        </GlassCard>
    );
}
