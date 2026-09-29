import { Pressable, Text, View } from 'react-native';
import { PackageOpen, Plus } from 'lucide-react-native';
import { GradientPill } from '@/components/reusable/GradientPill';
import { CartItem, type CartItemType } from '@/components/cart/CartItem';
import { getMonthlyProductImage, type MonthlyGroceryCard } from '@/api/monthly-grocery/monthly-grocery.service';

type Props = {
    items: MonthlyGroceryCard['items'];
    isTiny: boolean;
    pad: number;
    sectionTitleSize: number;
    onGoToCart: () => void;
    onRemoveItem: (itemId: string) => void;
    onUpdateQuantity: (itemId: string, quantity: number) => void;
};

/** Products section: header + "Add from Cart", then shared CartItem rows (or empty state). */
export function PackageProductList({
    items,
    isTiny,
    pad,
    sectionTitleSize,
    onGoToCart,
    onRemoveItem,
    onUpdateQuantity,
}: Props) {
    return (
        <>
            {/* Section header */}
            <View
                style={{ paddingHorizontal: pad, marginTop: isTiny ? 18 : 24, marginBottom: isTiny ? 10 : 12 }}
                className="flex-row items-center justify-between"
            >
                <Text style={{ fontSize: sectionTitleSize }} className="font-lufga-bold text-slate-950">
                    Products
                </Text>
                <GradientPill style={{ height: isTiny ? 36 : 40 }} className="rounded-full">
                    <Pressable
                        style={{ paddingHorizontal: isTiny ? 12 : 16 }}
                        className="flex-1 flex-row items-center active:opacity-80"
                        onPress={onGoToCart}
                    >
                        <Plus size={isTiny ? 13 : 15} color="#171717" strokeWidth={2.8} />
                        <Text style={{ fontSize: isTiny ? 11 : 13, marginLeft: 6 }} className="font-lufga-bold text-slate-950">
                            Add from Cart
                        </Text>
                    </Pressable>
                </GradientPill>
            </View>

            {items.length === 0 ? (
                <View
                    style={{ marginHorizontal: pad, paddingHorizontal: isTiny ? 16 : 24, paddingVertical: isTiny ? 28 : 40 }}
                    className="items-center rounded-[28px] bg-white"
                >
                    <PackageOpen size={isTiny ? 28 : 36} color="#b77900" />
                    <Text style={{ fontSize: isTiny ? 15 : 18, marginTop: 16 }} className="font-lufga-bold text-slate-950">
                        This list is empty
                    </Text>
                    <Text
                        style={{ fontSize: isTiny ? 11 : 13, marginTop: 8, lineHeight: isTiny ? 16 : 20 }}
                        className="text-center font-lufga text-slate-500"
                    >
                        Open your Cart and use "Add to Monthly Grocery" on Grocery products.
                    </Text>
                    <Pressable
                        style={{ marginTop: isTiny ? 16 : 20, paddingHorizontal: isTiny ? 18 : 24, paddingVertical: isTiny ? 10 : 12 }}
                        className="rounded-full bg-[#FFC400]"
                        onPress={onGoToCart}
                    >
                        <Text style={{ fontSize: isTiny ? 12 : 14 }} className="font-lufga-bold text-slate-950">
                            Go to Cart
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <View style={{ gap: isTiny ? 10 : 12, paddingHorizontal: pad, paddingBottom: 40 }}>
                    {items.map((item) => {
                        const product = item.product_id;
                        if (!product) return null;
                        const imageUri = getMonthlyProductImage(product);
                        const price = Number(product.final_price ?? product.price ?? 0);
                        const cartItem: CartItemType = {
                            id: item._id,
                            productId: String(product._id ?? product.id ?? item._id),
                            name: product.title,
                            store: product.business_id?.name || 'Grocery Provider',
                            price: item.variant?.price || price,
                            quantity: item.quantity,
                            imageUri: imageUri || undefined,
                            extras: [],
                            variant: item.variant?.name
                                ? { name: item.variant.name, price: item.variant.price ?? price }
                                : undefined,
                        };
                        return (
                            <CartItem
                                key={item._id}
                                item={cartItem}
                                onRemove={() => onRemoveItem(item._id)}
                                onUpdateQuantity={(_id, quantity) => onUpdateQuantity(item._id, quantity)}
                            />
                        );
                    })}
                </View>
            )}
        </>
    );
}
