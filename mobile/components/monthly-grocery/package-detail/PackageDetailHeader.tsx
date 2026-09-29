import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, MapPin, Trash2 } from 'lucide-react-native';

type Props = {
    name: string;
    completed: number;
    total: number;
    addressLabel: string;
    isTiny: boolean;
    iconBtnSize: number;
    iconSize: number;
    headerTitleSize: number;
    headerSubSize: number;
    pad: number;
    onBack: () => void;
    onOpenAddress: () => void;
    onDelete: () => void;
};

/** Top bar of the package detail: back, title/progress, address chip, delete. */
export function PackageDetailHeader({
    name,
    completed,
    total,
    addressLabel,
    isTiny,
    iconBtnSize,
    iconSize,
    headerTitleSize,
    headerSubSize,
    pad,
    onBack,
    onOpenAddress,
    onDelete,
}: Props) {
    return (
        <View style={{ paddingHorizontal: pad }} className="flex-row items-center bg-white/80 py-3">
            <Pressable
                style={{ height: iconBtnSize, width: iconBtnSize }}
                className="items-center justify-center rounded-2xl bg-slate-50"
                onPress={onBack}
            >
                <ChevronLeft size={iconSize} color="#171717" />
            </Pressable>
            <View className="ml-3 flex-1 min-w-0">
                <Text
                    style={{ fontSize: headerTitleSize }}
                    className="font-lufga-bold text-slate-950"
                    numberOfLines={1}
                >
                    {name}
                </Text>
                <Text
                    style={{ fontSize: headerSubSize, marginTop: 2 }}
                    className="font-lufga text-slate-400"
                >
                    {completed} of {total} completed
                </Text>
            </View>
            <Pressable
                style={{
                    paddingHorizontal: isTiny ? 8 : 12,
                    paddingVertical: isTiny ? 6 : 8,
                    marginRight: isTiny ? 6 : 8,
                }}
                className="flex-row items-center rounded-full bg-amber-50 active:opacity-70"
                onPress={onOpenAddress}
            >
                <MapPin size={isTiny ? 13 : 15} color="#b77900" />
                <Text
                    style={{ fontSize: isTiny ? 10 : 12, marginLeft: 4, maxWidth: isTiny ? 56 : 80 }}
                    className="font-lufga-semibold text-amber-700"
                    numberOfLines={1}
                >
                    {addressLabel}
                </Text>
            </Pressable>
            <Pressable
                style={{ height: iconBtnSize, width: iconBtnSize }}
                className="items-center justify-center rounded-full bg-red-50"
                onPress={onDelete}
            >
                <Trash2 size={isTiny ? 15 : 18} color="#ef4444" />
            </Pressable>
        </View>
    );
}
