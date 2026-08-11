import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/AppBackground';
import { ChevronLeft, PackageOpen, Plus } from 'lucide-react-native';
import type { MonthlyGroceryCard } from '@/api/monthly-grocery/monthly-grocery.service';
import {
    useDeleteMonthlyGroceryCard,
    useMonthlyGroceryCards,
} from '@/api/monthly-grocery/useMonthlyGroceryQueries';
import { MonthlyPackageCartPage } from './MonthlyPackageCartPage';
import { AddProductToListPage } from './AddProductToListPage';
import { MonthlyGroceryListCard } from '@/components/monthly-grocery/MonthlyGroceryListCard';
import { PackageDetailView } from '@/components/monthly-grocery/PackageDetailView';
import { CreateMonthlyListModal } from '@/components/monthly-grocery/CreateMonthlyListModal';

type MonthlyGroceryPageProps = {
    onBack?: () => void;
    onGoToCart?: () => void;
};

export function MonthlyGroceryPage({ onBack, onGoToCart }: MonthlyGroceryPageProps) {
    const { data: cards = [], isLoading, isError, refetch } = useMonthlyGroceryCards();
    const [openedCardId, setOpenedCardId] = useState('');
    const [checkoutCardId, setCheckoutCardId] = useState('');
    const [addProductCardId, setAddProductCardId] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    const deleteCard = useDeleteMonthlyGroceryCard();

    const openedCard = cards.find((card) => card._id === openedCardId);

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
            <PackageDetailView
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
                            {cards.map((card) => (
                                <MonthlyGroceryListCard
                                    key={card._id}
                                    card={card}
                                    onOpen={() => setOpenedCardId(card._id)}
                                    onDelete={() => handleDelete(card)}
                                    onOrder={() => handleOrderList(card)}
                                />
                            ))}
                        </View>
                    )}
                    <View className="h-10" />
                </ScrollView>

                <CreateMonthlyListModal
                    visible={showCreate}
                    onClose={() => setShowCreate(false)}
                    onCreated={(card) => setOpenedCardId(card._id)}
                />
            </SafeAreaView>
        </AppBackground>
    );
}
