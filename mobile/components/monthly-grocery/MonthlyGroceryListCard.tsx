import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
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
    const { width } = useWindowDimensions();
    const isTiny = width < 340;
    const isSmall = width < 380;

    const pad = isTiny ? 12 : isSmall ? 14 : 16;
    const iconBoxSize = isTiny ? 52 : isSmall ? 58 : 64;
    const iconSize = isTiny ? 22 : isSmall ? 25 : 28;
    const titleSize = isTiny ? 14 : isSmall ? 16 : 18;
    const subtitleSize = isTiny ? 11 : isSmall ? 12 : 14;
    const thumbSize = isTiny ? 48 : isSmall ? 52 : 56;
    const thumbGap = isTiny ? 6 : 8;
    const btnHeight = isTiny ? 44 : isSmall ? 46 : 48;
    const btnFontSize = isTiny ? 12 : isSmall ? 13 : 14;
    const btnIconSize = isTiny ? 15 : isSmall ? 16 : 18;
    const menuBtnSize = isTiny ? 32 : isSmall ? 36 : 36;

    // how many thumbnails can fit in a row without overflow
    // available width = card width (screen - 2*listPadding) - 2*pad - (iconBox + gap)
    const listPadding = isTiny ? 14 : isSmall ? 16 : 20;
    const cardWidth = width - listPadding * 2;
    const thumbAreaWidth = cardWidth - pad * 2;
    const maxThumbs = Math.max(1, Math.floor((thumbAreaWidth + thumbGap) / (thumbSize + thumbGap)));

    const total = cardTotal(card);
    const quantity = card.items.reduce((sum, item) => sum + item.quantity, 0);
    const visibleItems = card.items.filter((item) => item.product_id).slice(0, maxThumbs);
    const remaining = Math.max(0, card.items.length - visibleItems.length);

    return (
        <GlassCard variant="light" className="rounded-[28px]">
            <View style={{ padding: pad }}>
                <Pressable className="flex-row items-center" onPress={onOpen}>
                    <View
                        style={{ height: iconBoxSize, width: iconBoxSize }}
                        className="items-center justify-center rounded-2xl bg-amber-100"
                    >
                        <PackageOpen size={iconSize} color="#b77900" strokeWidth={2.3} />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text
                            style={{ fontSize: titleSize }}
                            className="font-lufga-bold text-slate-950"
                            numberOfLines={1}
                        >
                            {card.name}
                        </Text>
                        <Text style={{ fontSize: subtitleSize, marginTop: 3 }} className="font-lufga text-slate-400">
                            {quantity} {quantity === 1 ? 'item' : 'items'} · Rs {total.toLocaleString()}
                        </Text>
                    </View>
                    <Pressable
                        style={{ height: menuBtnSize, width: menuBtnSize }}
                        className="items-center justify-center rounded-full active:bg-slate-100"
                        onPress={onMenu}
                    >
                        <MoreHorizontal size={isTiny ? 18 : 22} color="#94a3b8" />
                    </Pressable>
                </Pressable>

                {visibleItems.length > 0 && (
                    <Pressable
                        style={{ flexDirection: 'row', flexWrap: 'nowrap', marginTop: isTiny ? 10 : 14 }}
                        onPress={onOpen}
                    >
                        {visibleItems.map((item) => {
                            const uri = getMonthlyProductImage(item.product_id);
                            return (
                                <View
                                    key={item._id}
                                    style={{ height: thumbSize, width: thumbSize, marginRight: thumbGap }}
                                    className="items-center justify-center overflow-hidden rounded-2xl bg-slate-100"
                                >
                                    {uri ? (
                                        <Image source={{ uri }} style={{ width: thumbSize, height: thumbSize }} resizeMode="contain" />
                                    ) : (
                                        <Text style={{ fontSize: isTiny ? 18 : 22 }}>🛒</Text>
                                    )}
                                </View>
                            );
                        })}
                        {remaining > 0 && (
                            <View
                                style={{ height: thumbSize, width: thumbSize }}
                                className="items-center justify-center rounded-2xl bg-slate-100"
                            >
                                <Text style={{ fontSize: subtitleSize }} className="font-lufga-bold text-slate-500">
                                    +{remaining}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                )}

                <GradientPill style={{ marginTop: isTiny ? 10 : 14, height: btnHeight }} className="rounded-2xl">
                    <Pressable
                        className="flex-1 flex-row items-center justify-center active:opacity-80"
                        onPress={onOrder}
                    >
                        <ShoppingCart size={btnIconSize} color="#171717" strokeWidth={2.5} />
                        <Text style={{ fontSize: btnFontSize, marginLeft: isTiny ? 6 : 8 }} className="font-lufga-bold text-slate-950">
                            Order entire list · Rs {total.toLocaleString()}
                        </Text>
                    </Pressable>
                </GradientPill>
            </View>
        </GlassCard>
    );
}
