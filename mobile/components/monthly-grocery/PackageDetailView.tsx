import { useMemo, useState } from 'react';
import { type DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import { Alert, ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/AppBackground';
import {
    updateMonthlyGroceryAddress,
    type MonthlyGroceryCard,
} from '@/api/monthly-grocery/monthly-grocery.service';
import type { Address } from '@/api/addresses/address.service';
import {
    useRemoveMonthlyGroceryItem,
    useUpdateMonthlyGroceryCard,
    useUpdateMonthlyGroceryItem,
} from '@/api/monthly-grocery/useMonthlyGroceryQueries';
import { cardTotal } from './cardTotal';
import { PackageDetailHeader } from './package-detail/PackageDetailHeader';
import { PackageSummaryBanner } from './package-detail/PackageSummaryBanner';
import { PackageProductList } from './package-detail/PackageProductList';
import { PackageAddressModal } from './package-detail/PackageAddressModal';
import { AutoOrderDateModal } from './package-detail/AutoOrderDateModal';

type PackageDetailViewProps = {
    card: MonthlyGroceryCard;
    onBack: () => void;
    onDelete: () => void;
    onGoToCart: () => void;
};

export function PackageDetailView({ card, onBack, onDelete, onGoToCart }: PackageDetailViewProps) {
    const linkedAddress =
        typeof card.address_id === 'object' && card.address_id ? card.address_id : null;
    const linkedAddressId =
        linkedAddress?._id || (typeof card.address_id === 'string' ? card.address_id : null);

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showAutoOrderPicker, setShowAutoOrderPicker] = useState(false);
    const [autoOrderDate, setAutoOrderDate] = useState(
        card.auto_order_date ? new Date(card.auto_order_date) : null
    );
    const [draftAutoOrderDate, setDraftAutoOrderDate] = useState<Date | null>(autoOrderDate);
    const [selectedAddressLabel, setSelectedAddressLabel] = useState(
        card.address_name || linkedAddress?.label || 'Address'
    );

    const updateItem = useUpdateMonthlyGroceryItem();
    const removeItem = useRemoveMonthlyGroceryItem();
    const updateCard = useUpdateMonthlyGroceryCard();
    const calendarStyles = useDefaultStyles();

    const items = card.items;
    const completed = items.filter((item) => item.checked).length;
    const total = useMemo(() => cardTotal(card), [card]);

    const { width } = useWindowDimensions();
    const isTiny = width < 340;
    const isSmall = width < 380;
    const pad = isTiny ? 14 : isSmall ? 16 : 20;
    const iconBtnSize = isTiny ? 38 : isSmall ? 40 : 44;
    const iconSize = isTiny ? 18 : isSmall ? 20 : 23;
    const headerTitleSize = isTiny ? 15 : isSmall ? 17 : 20;
    const headerSubSize = isTiny ? 10 : 12;
    const bannerPad = isTiny ? 14 : isSmall ? 16 : 20;
    const bannerTitleSize = isTiny ? 18 : isSmall ? 20 : 24;
    const bannerSubSize = isTiny ? 11 : isSmall ? 12 : 13;
    const sectionTitleSize = isTiny ? 15 : isSmall ? 16 : 18;

    const handleAddressSelected = async (address: Address) => {
        try {
            await updateMonthlyGroceryAddress(card._id, address._id);
            setSelectedAddressLabel(address.label);
            setShowAddressModal(false);
        } catch {
            Alert.alert('Could not save address', 'Please try selecting the address again.');
        }
    };

    const handleAddressChanged = (address: Address) => {
        if (address._id === linkedAddressId) setSelectedAddressLabel(address.label);
    };

    const handleAutoOrderDate = ({ date }: { date: DateType }) => {
        if (!date) return;
        const nextDate =
            date instanceof Date
                ? date
                : typeof date === 'object' && 'toDate' in date
                    ? date.toDate()
                    : new Date(date);
        nextDate.setHours(0, 0, 0, 0);
        setDraftAutoOrderDate(nextDate);
    };

    const saveAutoOrderDate = async () => {
        if (!draftAutoOrderDate) return;
        setAutoOrderDate(draftAutoOrderDate);
        setShowAutoOrderPicker(false);
        await updateCard.mutateAsync({
            cardId: card._id,
            name: card.name,
            autoOrderEnabled: true,
            autoOrderDate: draftAutoOrderDate.toISOString(),
        });
    };

    const openAutoOrderPicker = () => {
        setDraftAutoOrderDate(autoOrderDate || new Date());
        setShowAutoOrderPicker(true);
    };

    const autoOrderLabel = autoOrderDate
        ? autoOrderDate.toLocaleDateString('en-PK', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
        : 'Set date';

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <PackageDetailHeader
                    name={card.name}
                    completed={completed}
                    total={items.length}
                    addressLabel={selectedAddressLabel}
                    isTiny={isTiny}
                    iconBtnSize={iconBtnSize}
                    iconSize={iconSize}
                    headerTitleSize={headerTitleSize}
                    headerSubSize={headerSubSize}
                    pad={pad}
                    onBack={onBack}
                    onOpenAddress={() => setShowAddressModal(true)}
                    onDelete={onDelete}
                />

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <PackageSummaryBanner
                        name={card.name}
                        itemCount={items.length}
                        total={total}
                        autoOrderDate={autoOrderDate}
                        autoOrderLabel={autoOrderLabel}
                        isTiny={isTiny}
                        isSmall={isSmall}
                        pad={pad}
                        bannerPad={bannerPad}
                        bannerTitleSize={bannerTitleSize}
                        bannerSubSize={bannerSubSize}
                        disabled={updateCard.isPending}
                        onOpenAutoOrder={openAutoOrderPicker}
                    />

                    <PackageProductList
                        items={items}
                        isTiny={isTiny}
                        pad={pad}
                        sectionTitleSize={sectionTitleSize}
                        onGoToCart={onGoToCart}
                        onRemoveItem={(itemId) =>
                            removeItem.mutate({ cardId: card._id, itemId })
                        }
                        onUpdateQuantity={(itemId, quantity) =>
                            updateItem.mutate({ cardId: card._id, itemId, updates: { quantity } })
                        }
                    />

                    <View className="h-8" />
                </ScrollView>
            </SafeAreaView>

            <PackageAddressModal
                visible={showAddressModal}
                isTiny={isTiny}
                pad={pad}
                iconBtnSize={iconBtnSize}
                iconSize={iconSize}
                onClose={() => setShowAddressModal(false)}
                onAddressSelected={handleAddressSelected}
                onAddressChanged={handleAddressChanged}
            />

            <AutoOrderDateModal
                visible={showAutoOrderPicker}
                isTiny={isTiny}
                pad={pad}
                draftDate={draftAutoOrderDate}
                calendarStyles={calendarStyles}
                saving={updateCard.isPending}
                onClose={() => setShowAutoOrderPicker(false)}
                onChange={handleAutoOrderDate}
                onSave={saveAutoOrderDate}
            />
        </AppBackground>
    );
}
