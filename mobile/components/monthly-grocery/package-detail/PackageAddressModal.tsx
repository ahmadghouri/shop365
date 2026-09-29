import { Modal, Pressable, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { LocationAddressManager } from '@/components/LocationAddressManager';
import type { Address } from '@/api/addresses/address.service';

type Props = {
    visible: boolean;
    isTiny: boolean;
    pad: number;
    iconBtnSize: number;
    iconSize: number;
    onClose: () => void;
    onAddressSelected: (address: Address) => void;
    onAddressChanged: (address: Address) => void;
};

/** Bottom-sheet modal to choose the package's delivery address. */
export function PackageAddressModal({
    visible,
    isTiny,
    pad,
    iconBtnSize,
    iconSize,
    onClose,
    onAddressSelected,
    onAddressChanged,
}: Props) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable className="flex-1 justify-end bg-black/45" onPress={onClose}>
                <Pressable
                    style={{ paddingHorizontal: pad, paddingBottom: isTiny ? 24 : 32, paddingTop: isTiny ? 14 : 16 }}
                    className="max-h-[78%] rounded-t-[32px] bg-white"
                    onPress={(event) => event.stopPropagation()}
                >
                    <View style={{ marginBottom: isTiny ? 12 : 16 }} className="flex-row items-center justify-between">
                        <View>
                            <Text style={{ fontSize: isTiny ? 18 : 22 }} className="font-lufga-bold text-slate-950">
                                Choose Address
                            </Text>
                            <Text style={{ fontSize: isTiny ? 11 : 13, marginTop: 4 }} className="font-lufga text-slate-400">
                                Select a saved delivery address
                            </Text>
                        </View>
                        <Pressable
                            style={{ height: iconBtnSize, width: iconBtnSize }}
                            className="items-center justify-center rounded-full bg-slate-100 active:opacity-60"
                            onPress={onClose}
                        >
                            <ChevronLeft size={iconSize} color="#334155" />
                        </Pressable>
                    </View>
                    <View style={{ height: isTiny ? 380 : 480 }}>
                        <LocationAddressManager
                            onAddressSelected={onAddressSelected}
                            onAddressChanged={onAddressChanged}
                        />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
