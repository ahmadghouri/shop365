import { useMemo } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/AppBackground';
import {
    ChevronLeft,
    Minus,
    PackageOpen,
    Plus,
    Trash2,
} from 'lucide-react-native';
import {
    getMonthlyProductImage,
    type MonthlyGroceryCard,
} from '@/api/monthly-grocery/monthly-grocery.service';
import {
    useRemoveMonthlyGroceryItem,
    useUpdateMonthlyGroceryItem,
} from '@/api/monthly-grocery/useMonthlyGroceryQueries';
import { cardTotal } from './cardTotal';

type PackageDetailViewProps = {
    card: MonthlyGroceryCard;
    onBack: () => void;
    onDelete: () => void;
    onGoToCart: () => void;
};

export function PackageDetailView({ card, onBack, onDelete, onGoToCart }: PackageDetailViewProps) {
    const updateItem = useUpdateMonthlyGroceryItem();
    const removeItem = useRemoveMonthlyGroceryItem();
    const items = card.items;
    const completed = items.filter((item) => item.checked).length;
    const total = useMemo(() => cardTotal(card), [card]);

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <View className="flex-row items-center bg-white/80 px-5 py-3">
                    <Pressable className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-50" onPress={onBack}>
                        <ChevronLeft size={23} color="#171717" />
                    </Pressable>
                    <View className="ml-4 flex-1">
                        <Text className="text-xl font-lufga-bold text-slate-950" numberOfLines={1}>{card.name}</Text>
                        <Text className="mt-0.5 text-xs font-lufga text-slate-400">{completed} of {items.length} completed</Text>
                    </View>
                    <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-red-50" onPress={onDelete}>
                        <Trash2 size={18} color="#ef4444" />
                    </Pressable>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="mx-5 mt-5 rounded-[28px] bg-[#1D1D1D] p-5">
                        <Text className="text-xs font-lufga-semibold uppercase tracking-widest text-amber-300">Grocery Package</Text>
                        <Text className="mt-2 text-2xl font-lufga-bold text-white">{card.name}</Text>
                        <View className="mt-5 flex-row items-center justify-between">
                            <Text className="font-lufga text-slate-300">{items.length} saved products</Text>
                            <Text className="text-lg font-lufga-bold text-amber-300">Rs {total.toLocaleString()}</Text>
                        </View>
                    </View>

                    <View className="mb-3 mt-6 flex-row items-center justify-between px-5">
                        <Text className="text-lg font-lufga-bold text-slate-950">Products</Text>
                        <Pressable className="flex-row items-center active:opacity-60" onPress={onGoToCart}>
                            <Plus size={15} color="#b77900" strokeWidth={2.8} />
                            <Text className="ml-1 font-lufga-semibold text-amber-700">Add from Cart</Text>
                        </Pressable>
                    </View>

                    {items.length === 0 ? (
                        <View className="mx-5 items-center rounded-[28px] bg-white px-6 py-10">
                            <PackageOpen size={36} color="#b77900" />
                            <Text className="mt-4 text-lg font-lufga-bold text-slate-950">This list is empty</Text>
                            <Text className="mt-2 text-center text-sm font-lufga text-slate-500">Open your Cart and use "Add to Monthly Grocery" on Grocery products.</Text>
                            <Pressable className="mt-5 rounded-full bg-[#FFC400] px-6 py-3" onPress={onGoToCart}>
                                <Text className="font-lufga-bold text-slate-950">Go to Cart</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View className="gap-3 px-5 pb-10">
                            {items.map((item) => {
                                const product = item.product_id;
                                if (!product) return null;
                                const imageUri = getMonthlyProductImage(product);
                                const price = Number(product.final_price ?? product.price ?? 0);
                                return (
                                    <View key={item._id} className="rounded-3xl bg-white p-3">
                                        <View className="flex-row items-center">
                                            <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                                                {imageUri ? (
                                                    <Image source={{ uri: imageUri }} className="h-full w-full" resizeMode="contain" />
                                                ) : (
                                                    <Text className="text-2xl">🛒</Text>
                                                )}
                                            </View>

                                            <View className="ml-3 flex-1">
                                                <Text className="text-[15px] font-lufga-semibold text-slate-900" numberOfLines={1}>
                                                    {product.title}
                                                </Text>
                                                <Text className="mt-0.5 text-xs font-lufga text-slate-400" numberOfLines={1}>
                                                    {product.business_id?.name || 'Grocery Provider'}
                                                </Text>
                                                {item.variant?.name && (
                                                    <Text className="mt-1 text-xs font-lufga-medium text-amber-700" numberOfLines={1}>
                                                        {item.variant.name}
                                                    </Text>
                                                )}
                                                <Text className="mt-2 text-base font-lufga-semibold text-slate-900">
                                                    Rs {((item.variant?.price || price) * item.quantity).toLocaleString()}
                                                </Text>
                                            </View>

                                            <View className="items-center gap-2">
                                                <Pressable
                                                    accessibilityLabel={`Remove ${product.title}`}
                                                    className="active:opacity-60"
                                                    onPress={() => removeItem.mutate({ cardId: card._id, itemId: item._id })}
                                                >
                                                    <Trash2 size={18} color="#ef4444" />
                                                </Pressable>
                                                <View className="flex-row items-center rounded-full bg-slate-100 p-1">
                                                    <Pressable
                                                        disabled={item.quantity <= 1}
                                                        className="h-7 w-7 items-center justify-center rounded-full bg-white disabled:opacity-40"
                                                        onPress={() => updateItem.mutate({
                                                            cardId: card._id,
                                                            itemId: item._id,
                                                            updates: { quantity: item.quantity - 1 },
                                                        })}
                                                    >
                                                        <Minus size={14} color="#1e293b" strokeWidth={2.5} />
                                                    </Pressable>
                                                    <Text className="mx-2 min-w-4 text-center text-sm font-lufga-medium text-slate-900">
                                                        {item.quantity}
                                                    </Text>
                                                    <Pressable
                                                        disabled={updateItem.isPending}
                                                        className="h-7 w-7 items-center justify-center rounded-full bg-[#EAB308] disabled:opacity-50"
                                                        onPress={() => updateItem.mutate({
                                                            cardId: card._id,
                                                            itemId: item._id,
                                                            updates: { quantity: item.quantity + 1 },
                                                        })}
                                                    >
                                                        <Plus size={14} color="#111827" strokeWidth={2.5} />
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </AppBackground>
    );
}
