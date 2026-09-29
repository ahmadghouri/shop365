import { Pressable, Text, View } from 'react-native';
import { Calendar } from 'lucide-react-native';

type Props = {
    name: string;
    itemCount: number;
    total: number;
    autoOrderDate: Date | null;
    autoOrderLabel: string;
    isTiny: boolean;
    isSmall: boolean;
    pad: number;
    bannerPad: number;
    bannerTitleSize: number;
    bannerSubSize: number;
    disabled?: boolean;
    onOpenAutoOrder: () => void;
};

/** Dark summary banner: package name, saved products, total, auto-order date. */
export function PackageSummaryBanner({
    name,
    itemCount,
    total,
    autoOrderDate,
    autoOrderLabel,
    isTiny,
    pad,
    bannerPad,
    bannerTitleSize,
    bannerSubSize,
    disabled,
    onOpenAutoOrder,
}: Props) {
    return (
        <View
            style={{ marginHorizontal: pad, padding: bannerPad, marginTop: isTiny ? 14 : 20 }}
            className="rounded-[28px] bg-[#1D1D1D]"
        >
            <Text
                style={{ fontSize: isTiny ? 9 : 11 }}
                className="font-lufga-semibold uppercase tracking-widest text-amber-300"
            >
                Grocery Package
            </Text>
            <Text
                style={{ fontSize: bannerTitleSize, marginTop: isTiny ? 6 : 8 }}
                className="font-lufga-bold text-white"
            >
                {name}
            </Text>
            <View style={{ marginTop: isTiny ? 12 : 20 }} className="flex-row items-center justify-between">
                <Text style={{ fontSize: bannerSubSize }} className="font-lufga text-slate-300">
                    {itemCount} saved products
                </Text>
                <Text style={{ fontSize: isTiny ? 15 : 18 }} className="font-lufga-bold text-amber-300">
                    Rs {total.toLocaleString()}
                </Text>
            </View>
            <Pressable
                style={{
                    marginTop: isTiny ? 12 : 20,
                    paddingHorizontal: isTiny ? 12 : 16,
                    paddingVertical: isTiny ? 10 : 12,
                }}
                className="flex-row items-center justify-between rounded-2xl bg-white/10 active:bg-white/20"
                onPress={onOpenAutoOrder}
                disabled={disabled}
            >
                <View className="flex-1 flex-row items-center">
                    <Calendar size={isTiny ? 15 : 18} color="#FCD34D" />
                    <View style={{ marginLeft: isTiny ? 8 : 12 }} className="flex-1">
                        <Text style={{ fontSize: isTiny ? 12 : 14 }} className="font-lufga-semibold text-white">
                            Auto-order
                        </Text>
                        <Text
                            style={{ fontSize: isTiny ? 10 : 12, marginTop: 2 }}
                            className="font-lufga text-slate-300"
                            numberOfLines={1}
                        >
                            {autoOrderDate ? `Next order: ${autoOrderLabel}` : 'Choose your next order date'}
                        </Text>
                    </View>
                </View>
                <Text
                    style={{ fontSize: isTiny ? 11 : 13, marginLeft: 8 }}
                    className="font-lufga-semibold text-amber-300"
                    numberOfLines={1}
                >
                    {autoOrderLabel}
                </Text>
            </Pressable>
        </View>
    );
}
