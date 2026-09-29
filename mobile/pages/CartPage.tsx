import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/AppBackground';
import { CartItem } from '@/components/cart/CartItem';
import { CartHeader } from '@/components/cart/CartHeader';
import { MonthlyGroceryBanner } from '@/components/cart/MonthlyGroceryBanner';
import { CartEmptyState } from '@/components/cart/CartEmptyState';
import { CartOrderSummary } from '@/components/cart/CartOrderSummary';
import { CartCheckoutBar } from '@/components/cart/CartCheckoutBar';
import { MinimumOrderNotMetModal } from '@/components/cart/MinimumOrderNotMetModal';
import { useMonthlyGroceryCards } from '@/api/monthly-grocery/useMonthlyGroceryQueries';
import { useCartStore } from '@/lib/cartStore';

type CartPageProps = {
    onBack?: () => void;
    onCheckout?: (excludedVendorIds?: string[]) => void;
    onMonthlyGrocery?: () => void;
};

export function CartPage({ onBack, onCheckout, onMonthlyGrocery }: CartPageProps) {
    const { items, updateQuantity, removeItem, getVendorSummaries, getTotal, loadCart } =
        useCartStore();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadCart();
        setRefreshing(false);
    };

    const { data: monthlyCards = [] } = useMonthlyGroceryCards();
    const [selectedCardId, setSelectedCardId] = useState('');
    const [showCardSelector, setShowCardSelector] = useState(false);
    const [minimumOpen, setMinimumOpen] = useState(false);

    useEffect(() => {
        if (!selectedCardId && monthlyCards.length > 0) setSelectedCardId(monthlyCards[0]._id);
        if (selectedCardId && !monthlyCards.some((card) => card._id === selectedCardId)) {
            setSelectedCardId(monthlyCards[0]?._id || '');
        }
    }, [monthlyCards, selectedCardId]);

    const vendorSummaries = getVendorSummaries();
    const total = getTotal();
    const blockedVendors = vendorSummaries.filter(
        (v) => v.minimumOrder > 0 && v.subtotal < v.minimumOrder
    );

    const handleCheckout = () => {
        if (blockedVendors.length > 0) {
            setMinimumOpen(true);
            return;
        }
        onCheckout?.();
    };

    const proceedWithoutBlocked = () => {
        setMinimumOpen(false);
        onCheckout?.(blockedVendors.map((v) => v.businessId));
    };

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <CartHeader itemCount={items.length} onBack={onBack} />

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#EAB308"
                            colors={['#EAB308']}
                        />
                    }
                >
                    <MonthlyGroceryBanner
                        cards={monthlyCards}
                        selectedCardId={selectedCardId}
                        showSelector={showCardSelector}
                        onOpenSelector={() => setShowCardSelector(true)}
                        onCloseSelector={() => setShowCardSelector(false)}
                        onSelectCard={setSelectedCardId}
                        onMonthlyGrocery={onMonthlyGrocery}
                    />

                    {items.length === 0 ? (
                        <CartEmptyState />
                    ) : (
                        <View className="mt-5 gap-3 px-5">
                            {items.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    onRemove={removeItem}
                                    onUpdateQuantity={updateQuantity}
                                />
                            ))}
                        </View>
                    )}

                    {items.length > 0 && (
                        <CartOrderSummary vendorSummaries={vendorSummaries} total={total} />
                    )}
                    <View className="h-32" />
                </ScrollView>

                {items.length > 0 && (
                    <CartCheckoutBar total={total} onCheckout={handleCheckout} />
                )}

                <MinimumOrderNotMetModal
                    open={minimumOpen}
                    vendors={blockedVendors}
                    onClose={() => setMinimumOpen(false)}
                    onCheckoutWithout={proceedWithoutBlocked}
                />
            </SafeAreaView>
        </AppBackground>
    );
}
