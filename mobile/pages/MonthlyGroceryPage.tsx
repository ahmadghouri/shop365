import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/AppBackground';
import {
    ChevronLeft,
    Minus,
    MoreHorizontal,
    PackageOpen,
    Plus,
    ShoppingCart,
    Trash2,
    X,
} from 'lucide-react-native';
import {
    getMonthlyProductImage,
    type MonthlyGroceryCard,
} from '@/api/monthly-grocery/monthly-grocery.service';
import {
    useCreateMonthlyGroceryCard,
    useDeleteMonthlyGroceryCard,
    useMonthlyGroceryCards,
    useRemoveMonthlyGroceryItem,
    useUpdateMonthlyGroceryItem,
} from '@/api/monthly-grocery/useMonthlyGroceryQueries';
import { MonthlyPackageCartPage } from './MonthlyPackageCartPage';
import { AddProductToListPage } from './AddProductToListPage';

type MonthlyGroceryPageProps = {
    onBack?: () => void;
    onGoToCart?: () => void;
};

function cardTotal(card: MonthlyGroceryCard) {
    return card.items.reduce((sum, item) => {
        const product = item.product_id;
        return sum + Number(product?.final_price ?? product?.price ?? 0) * item.quantity;
    }, 0);
}

export function MonthlyGroceryPage({ onBack, onGoToCart }: MonthlyGroceryPageProps) {
    const { data: cards = [], isLoading, isError, refetch } = useMonthlyGroceryCards();
    const [openedCardId, setOpenedCardId] = useState('');
    const [checkoutCardId, setCheckoutCardId] = useState('');
    const [addProductCardId, setAddProductCardId] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');

    const createCard = useCreateMonthlyGroceryCard();
    const deleteCard = useDeleteMonthlyGroceryCard();

    const openedCard = cards.find((card) => card._id === openedCardId);

    const handleCreate = async () => {
        const name = newName.trim();
        if (!name) {
            Alert.alert('List name required', 'Please enter a name such as Monthly Home or Office Pantry.');
            return;
        }
        try {
            const card = await createCard.mutateAsync({ name });
            setNewName('');
            setShowCreate(false);
            setOpenedCardId(card._id);
        } catch (error: any) {
            Alert.alert('Could not create list', error?.response?.data?.message || 'Please try again.');
        }
    };

    const handleDelete = (card: MonthlyGroceryCard) => {
        Alert.alert('Delete this list?', `${card.name} and all saved items will be removed.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteCard.mutateAsync(card._id);
                    if (openedCardId === card._id) setOpenedCardId('');
                },
            },
        ]);
    };

    const handleOrderList = (card: MonthlyGroceryCard) => {
        const products = card.items.filter((item) => item.product_id);
        if (!products.length) {
            Alert.alert('List is empty', 'Add Grocery products from your cart first.');
            return;
        }
        setCheckoutCardId(card._id);
    };

    const checkoutCard = cards.find((card) => card._id === checkoutCardId);

    if (addProductCardId) {
        return (
            <AddProductToListPage
                cardId={addProductCardId}
                onBack={() => setAddProductCardId('')}
            />
        );
    }

    if (checkoutCard) {
        return (
            <MonthlyPackageCartPage
                card={checkoutCard}
                onBack={() => setCheckoutCardId('')}
            />
        );
    }

    if (openedCard) {
        return (
            <PackageDetail
                card={openedCard}
                onBack={() => setOpenedCardId('')}
                onDelete={() => handleDelete(openedCard)}
                onGoToCart={() => setAddProductCardId(openedCard._id)}
            />
        );
    }

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <View className="flex-row items-center border-b border-slate-100 bg-white/80 px-5 py-3">
                    <Pressable
                        className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 active:opacity-60"
                        onPress={onBack}
                    >
                        <ChevronLeft size={23} color="#171717" />
                    </Pressable>
                    <Text className="ml-4 text-2xl font-lufga-bold text-slate-950">Monthly Packages</Text>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="mx-5 mt-5 rounded-[28px] bg-[#1D1D1D] px-5 py-6">
                        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-amber-400">
                            <PackageOpen size={23} color="#171717" />
                        </View>
                        <Text className="mt-4 text-xl font-lufga-bold text-white">Never run out again</Text>
                        <Text className="mt-1 max-w-[90%] text-sm leading-5 font-lufga text-slate-300">
                            Build a list once. Reorder your essentials in a single tap.
                        </Text>
                    </View>

                    <View className="mb-3 mt-7 flex-row items-center justify-between px-5">
                        <Text className="text-lg font-lufga-bold text-slate-950">Your lists</Text>
                        <Pressable className="flex-row items-center active:opacity-60" onPress={() => setShowCreate(true)}>
                            <Plus size={17} color="#b77900" strokeWidth={2.8} />
                            <Text className="ml-1 font-lufga-semibold text-amber-700">New list</Text>
                        </Pressable>
                    </View>

                    {isLoading ? (
                        <View className="items-center py-20">
                            <ActivityIndicator size="large" color="#EAB308" />
                        </View>
                    ) : isError ? (
                        <Pressable className="mx-5 items-center rounded-3xl bg-white p-8" onPress={() => refetch()}>
                            <Text className="font-lufga-semibold text-red-600">Lists could not be loaded</Text>
                            <Text className="mt-2 font-lufga text-slate-400">Tap to try again</Text>
                        </Pressable>
                    ) : cards.length === 0 ? (
                        <View className="mx-5 items-center rounded-[28px] bg-white px-7 py-10">
                            <View className="h-20 w-20 items-center justify-center rounded-3xl bg-amber-100">
                                <PackageOpen size={35} color="#b77900" />
                            </View>
                            <Text className="mt-5 text-xl font-lufga-bold text-slate-950">Create your first list</Text>
                            <Text className="mt-2 text-center text-sm leading-5 font-lufga text-slate-500">
                                Keep each home's grocery essentials organized in one reusable package.
                            </Text>
                            <Pressable className="mt-6 rounded-full bg-[#FFC400] px-7 py-4" onPress={() => setShowCreate(true)}>
                                <Text className="font-lufga-bold text-slate-950">Create New List</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View className="gap-4 px-5">
                            {cards.map((card) => {
                                const total = cardTotal(card);
                                const quantity = card.items.reduce((sum, item) => sum + item.quantity, 0);
                                const visibleItems = card.items.filter((item) => item.product_id).slice(0, 4);
                                const remaining = Math.max(0, card.items.length - visibleItems.length);

                                return (
                                    <View key={card._id} className="rounded-[28px] bg-white p-4 shadow-sm shadow-slate-200">
                                        <Pressable className="flex-row items-center" onPress={() => setOpenedCardId(card._id)}>
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
                                                onPress={() => handleDelete(card)}
                                            >
                                                <MoreHorizontal size={22} color="#94a3b8" />
                                            </Pressable>
                                        </Pressable>

                                        <Pressable className="mt-4 flex-row" onPress={() => setOpenedCardId(card._id)}>
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

                                        <Pressable
                                            className="mt-4 flex-row items-center justify-center rounded-2xl bg-[#FFC400] py-4 active:opacity-80"
                                            onPress={() => handleOrderList(card)}
                                        >
                                            <ShoppingCart size={18} color="#171717" strokeWidth={2.5} />
                                            <Text className="ml-2 font-lufga-bold text-slate-950">
                                                Order entire list · Rs {total.toLocaleString()}
                                            </Text>
                                        </Pressable>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                    <View className="h-10" />
                </ScrollView>

                <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
                    <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setShowCreate(false)}>
                        <Pressable className="rounded-t-[32px] bg-white px-5 pb-9 pt-4" onPress={() => { }}>
                            <View className="mb-6 flex-row items-center justify-between">
                                <View>
                                    <Text className="text-2xl font-lufga-bold text-slate-950">Create New List</Text>
                                    <Text className="mt-1 text-sm font-lufga text-slate-400">Give your grocery package a name</Text>
                                </View>
                                <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-slate-100" onPress={() => setShowCreate(false)}>
                                    <X size={19} color="#334155" />
                                </Pressable>
                            </View>
                            <Text className="mb-2 text-sm font-lufga-semibold text-slate-700">List name</Text>
                            <TextInput
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-lufga text-slate-950"
                                value={newName}
                                onChangeText={setNewName}
                                placeholder="e.g. Monthly Home, Office Pantry"
                                placeholderTextColor="#94a3b8"
                                maxLength={50}
                                autoCapitalize="words"
                            />
                            <Pressable
                                disabled={createCard.isPending}
                                className="mt-6 flex-row items-center justify-center rounded-full bg-[#FFC400] py-4 disabled:opacity-60"
                                onPress={handleCreate}
                            >
                                {createCard.isPending ? <ActivityIndicator color="#171717" /> : (
                                    <>
                                        <Plus size={19} color="#171717" />
                                        <Text className="ml-2 font-lufga-bold text-slate-950">Create List</Text>
                                    </>
                                )}
                            </Pressable>
                        </Pressable>
                    </Pressable>
                </Modal>
            </SafeAreaView>
        </AppBackground>
    );
}

type PackageDetailProps = {
    card: MonthlyGroceryCard;
    onBack: () => void;
    onDelete: () => void;
    onGoToCart: () => void;
};

function PackageDetail({ card, onBack, onDelete, onGoToCart }: PackageDetailProps) {
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