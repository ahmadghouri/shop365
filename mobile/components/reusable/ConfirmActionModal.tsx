import { Modal, Pressable, Text, View } from 'react-native';

type ConfirmActionModalProps = {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onClose: () => void;
    onConfirm: () => void;
};

export function ConfirmActionModal({
    visible,
    title,
    message,
    confirmLabel = 'Confirm',
    onClose,
    onConfirm,
}: ConfirmActionModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable className="flex-1 items-center justify-center bg-black/45 px-6" onPress={onClose}>
                <Pressable className="w-full rounded-3xl bg-white p-6" onPress={(event) => event.stopPropagation()}>
                    <Text className="text-xl font-lufga-bold text-slate-950">{title}</Text>
                    <Text className="mt-2 text-sm leading-5 font-lufga text-slate-500">{message}</Text>
                    <View className="mt-6 flex-row gap-3">
                        <Pressable
                            className="flex-1 items-center justify-center rounded-full border border-slate-200 py-3 active:opacity-70"
                            onPress={onClose}
                        >
                            <Text className="font-lufga-semibold text-slate-700">Cancel</Text>
                        </Pressable>
                        <Pressable
                            className="flex-1 items-center justify-center rounded-full bg-red-500 py-3 active:opacity-80"
                            onPress={onConfirm}
                        >
                            <Text className="font-lufga-semibold text-white">{confirmLabel}</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
