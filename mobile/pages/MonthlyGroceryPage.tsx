import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Text,
    useWindowDimensions,
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
import { ConfirmActionModal } from '@/components/reusable/ConfirmActionModal';
import { GradientPill } from '@/components/reusable/GradientPill';

type MonthlyGroceryPageProps = {
    onBack?: () => void;
    onGoToCart?: () => void;
    onPackageCartChange?: (open: boolean) => void;
};

export function MonthlyGroceryPage({ onBack, onGoToCart, onPackageCartChange }: MonthlyGroceryPageProps) {
    const { data: cards = [], isLoading, isError, refetch } = useMonthlyGroceryCards();
    const [openedCardId, setOpenedCardId] = useState('');
    const [checkoutCardId, setCheckoutCardId] = useState('');
    const [addProductCardId, setAddProductCardId] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [menuCard, setMenuCard] = useState<MonthlyGroceryCard | null>(null);
    const [editCard, setEditCard] = useState<MonthlyGroceryCard | null>(null);
    const [deleteCardTarget, setDeleteCardTarget] = useState<MonthlyGroceryCard | null>(null);

    const { width } = useWindowDimensions();
    const isTiny = width < 340;
    const isSmall = width < 380;
    const bannerPadding = isTiny ? 14 : isSmall ? 16 : 20;
    const bannerIconSize = isTiny ? 18 : isSmall ? 20 : 23;
    const bannerTitleSize = isTiny ? 16 : isSmall ? 18 : 20;
    const bannerBodySize = isTiny ? 11 : isSmall ? 12 : 14;
    const headerTitleSize = isTiny ? 18 : isSmall ? 20 : 24;
    const sectionTitleSize = isTiny ? 15 : isSmall ? 16 : 18;

    const deleteCard = useDeleteMonthlyGroceryCard();

    const openedCard = cards.find((card) => card._id === openedCardId);

    const handleDelete = (card: MonthlyGroceryCard) => {
        setDeleteCardTarget(card);
    };

    const confirmDelete = async () => {
        if (!deleteCardTarget) return;
        const card = deleteCardTarget;
        await deleteCard.mutateAsync(card._id);
        if (openedCardId === card._id) setOpenedCardId('');
        setDeleteCardTarget(null);
    };

    const handleOrderList = (card: MonthlyGroceryCard) => {
        const products = card.items.filter((item) => item.product_id);
        if (!products.length) {
            Alert.alert('List is empty', 'Add Grocery products from your cart first.');
            return;
        }
        setCheckoutCardId(card._id);
        onPackageCartChange?.(true);
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
                onBack={() => {
                    setCheckoutCardId('');
                    onPackageCartChange?.(false);
                }}
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
                <View
                    style={{ paddingHorizontal: bannerPadding }}
                    className="flex-row items-center border-b border-slate-100 bg-white/80 py-3"
                >
                    <Pressable
                        style={{ height: isTiny ? 40 : 44, width: isTiny ? 40 : 44 }}
                        className="items-center justify-center rounded-2xl bg-slate-50 active:opacity-60"
                        onPress={onBack}
                    >
                        <ChevronLeft size={bannerIconSize} color="#171717" />
                    </Pressable>
                    <Text
                        style={{ fontSize: headerTitleSize }}
                        className="ml-3 flex-1 font-lufga-bold text-slate-950"
                        numberOfLines={1}
                    >
                        Monthly Packages
                    </Text>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View
                        style={{ marginHorizontal: bannerPadding, paddingHorizontal: bannerPadding, paddingVertical: isTiny ? 16 : 22 }}
                        className="mt-5 rounded-[28px] bg-[#1D1D1D]"
                    >
                        <View
                            style={{ height: isTiny ? 38 : 44, width: isTiny ? 38 : 44 }}
                            className="items-center justify-center rounded-2xl bg-amber-400"
                        >
                            <PackageOpen size={bannerIconSize} color="#171717" />
                        </View>
                        <Text
                            style={{ fontSize: bannerTitleSize, marginTop: isTiny ? 10 : 14 }}
                            className="font-lufga-bold text-white"
                        >
                            Never run out again
                        </Text>
                        <Text
                            style={{ fontSize: bannerBodySize, marginTop: 4, lineHeight: isTiny ? 17 : 20, maxWidth: '92%' }}
                            className="font-lufga text-slate-300"
                        >
                            Build a list once. Reorder your essentials in a single tap.
                        </Text>
                    </View>

                    <View
                        style={{ paddingHorizontal: bannerPadding, marginTop: isTiny ? 20 : 28, marginBottom: 12 }}
                        className="flex-row items-center justify-between"
                    >
                        <Text style={{ fontSize: sectionTitleSize }} className="font-lufga-bold text-slate-950">
                            Your lists
                        </Text>
                        <GradientPill style={{ height: isTiny ? 36 : 40 }} className="rounded-full">
                            <Pressable
                                style={{ paddingHorizontal: isTiny ? 12 : 16 }}
                                className="flex-1 flex-row items-center active:opacity-80"
                                onPress={() => setShowCreate(true)}
                            >
                                <Plus size={isTiny ? 14 : 16} color="#171717" strokeWidth={2.8} />
                                <Text style={{ fontSize: isTiny ? 12 : 14 }} className="ml-1.5 font-lufga-bold text-slate-950">
                                    New list
                                </Text>
                            </Pressable>
                        </GradientPill>
                    </View>

                    {isLoading ? (
                        <View className="items-center py-20">
                            <ActivityIndicator size="large" color="#EAB308" />
                        </View>
                    ) : isError ? (
                        <Pressable
                            style={{ marginHorizontal: bannerPadding }}
                            className="items-center rounded-3xl bg-white p-8"
                            onPress={() => refetch()}
                        >
                            <Text className="font-lufga-semibold text-red-600">Lists could not be loaded</Text>
                            <Text className="mt-2 font-lufga text-slate-400">Tap to try again</Text>
                        </Pressable>
                    ) : cards.length === 0 ? (
                        <View
                            style={{ marginHorizontal: bannerPadding, paddingHorizontal: isTiny ? 16 : 28, paddingVertical: isTiny ? 28 : 40 }}
                            className="items-center rounded-[28px] bg-white"
                        >
                            <View
                                style={{ height: isTiny ? 64 : 80, width: isTiny ? 64 : 80 }}
                                className="items-center justify-center rounded-3xl bg-amber-100"
                            >
                                <PackageOpen size={isTiny ? 28 : 35} color="#b77900" />
                            </View>
                            <Text style={{ fontSize: isTiny ? 17 : 20, marginTop: isTiny ? 14 : 20 }} className="font-lufga-bold text-slate-950">
                                Create your first list
                            </Text>
                            <Text style={{ fontSize: bannerBodySize, marginTop: 8, lineHeight: isTiny ? 17 : 20 }} className="text-center font-lufga text-slate-500">
                                Keep each home's grocery essentials organized in one reusable package.
                            </Text>
                            <Pressable
                                style={{ marginTop: isTiny ? 16 : 24, paddingHorizontal: isTiny ? 20 : 28, paddingVertical: isTiny ? 12 : 16 }}
                                className="rounded-full bg-[#FFC400]"
                                onPress={() => setShowCreate(true)}
                            >
                                <Text style={{ fontSize: isTiny ? 13 : 15 }} className="font-lufga-bold text-slate-950">
                                    Create New List
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={{ gap: isTiny ? 12 : 16, paddingHorizontal: bannerPadding }}>
                            {cards.map((card) => (
                                <MonthlyGroceryListCard
                                    key={card._id}
                                    card={card}
                                    onOpen={() => setOpenedCardId(card._id)}
                                    onMenu={() => setMenuCard(card)}
                                    onOrder={() => handleOrderList(card)}
                                />
                            ))}
                        </View>
                    )}
                    <View className="h-32" />
                </ScrollView>

                <CreateMonthlyListModal
                    visible={showCreate}
                    onClose={() => setShowCreate(false)}
                    onCreated={(card) => setOpenedCardId(card._id)}
                />
                <CreateMonthlyListModal
                    visible={Boolean(editCard)}
                    editingCard={editCard}
                    onClose={() => setEditCard(null)}
                    onCreated={() => undefined}
                    onUpdated={() => setEditCard(null)}
                />
                <Modal
                    visible={Boolean(menuCard)}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setMenuCard(null)}
                >
                    <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setMenuCard(null)}>
                        <Pressable
                            style={{ paddingHorizontal: bannerPadding, paddingBottom: isTiny ? 28 : 36, paddingTop: isTiny ? 16 : 20 }}
                            className="rounded-t-[30px] bg-white"
                            onPress={(event) => event.stopPropagation()}
                        >
                            <Text style={{ fontSize: isTiny ? 17 : 20 }} className="font-lufga-bold text-slate-950">
                                {menuCard?.name}
                            </Text>
                            <Text style={{ fontSize: bannerBodySize, marginTop: 4 }} className="font-lufga text-slate-400">
                                Manage this grocery list
                            </Text>
                            <Pressable
                                style={{ marginTop: isTiny ? 16 : 20, paddingHorizontal: 16, paddingVertical: isTiny ? 14 : 16 }}
                                className="flex-row items-center rounded-2xl bg-slate-50 active:opacity-70"
                                onPress={() => {
                                    setEditCard(menuCard);
                                    setMenuCard(null);
                                }}
                            >
                                <Text style={{ fontSize: isTiny ? 13 : 15 }} className="font-lufga-semibold text-slate-900">
                                    Edit List
                                </Text>
                            </Pressable>
                            <Pressable
                                style={{ marginTop: isTiny ? 10 : 12, paddingHorizontal: 16, paddingVertical: isTiny ? 14 : 16 }}
                                className="flex-row items-center rounded-2xl bg-red-50 active:opacity-70"
                                onPress={() => {
                                    const card = menuCard;
                                    setMenuCard(null);
                                    if (card) handleDelete(card);
                                }}
                            >
                                <Text style={{ fontSize: isTiny ? 13 : 15 }} className="font-lufga-semibold text-red-600">
                                    Delete List
                                </Text>
                            </Pressable>
                        </Pressable>
                    </Pressable>
                </Modal>
                <ConfirmActionModal
                    visible={Boolean(deleteCardTarget)}
                    title="Delete this list?"
                    message={deleteCardTarget ? `${deleteCardTarget.name} and all saved items will be removed.` : ''}
                    confirmLabel="Delete"
                    onClose={() => setDeleteCardTarget(null)}
                    onConfirm={confirmDelete}
                />
            </SafeAreaView>
        </AppBackground>
    );
}
