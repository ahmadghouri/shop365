import { Modal, Pressable, Text, View } from 'react-native';
import DateTimePicker, { type DateType } from 'react-native-ui-datepicker';

type Props = {
    visible: boolean;
    isTiny: boolean;
    pad: number;
    draftDate: Date | null;
    calendarStyles: any;
    saving?: boolean;
    onClose: () => void;
    onChange: (payload: { date: DateType }) => void;
    onSave: () => void;
};

/** Modal calendar to pick the package's next auto-order date. */
export function AutoOrderDateModal({
    visible,
    isTiny,
    pad,
    draftDate,
    calendarStyles,
    saving,
    onClose,
    onChange,
    onSave,
}: Props) {
    if (!visible) return null;
    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <Pressable
                style={{ paddingHorizontal: pad }}
                className="flex-1 items-center justify-center bg-black/45"
                onPress={onClose}
            >
                <Pressable
                    style={{ padding: isTiny ? 16 : 20 }}
                    className="w-full rounded-3xl bg-white"
                    onPress={(event) => event.stopPropagation()}
                >
                    <Text style={{ fontSize: isTiny ? 17 : 20 }} className="font-lufga-bold text-slate-950">
                        Choose auto-order date
                    </Text>
                    <Text style={{ fontSize: isTiny ? 11 : 13, marginTop: 4 }} className="font-lufga text-slate-500">
                        Select the date for the next order.
                    </Text>
                    <View style={{ marginTop: isTiny ? 12 : 16 }}>
                        <DateTimePicker
                            mode="single"
                            date={draftDate || new Date()}
                            minDate={new Date()}
                            onChange={onChange}
                            styles={calendarStyles}
                        />
                    </View>
                    <Pressable
                        style={{ marginTop: isTiny ? 12 : 16, paddingVertical: isTiny ? 12 : 16 }}
                        className="items-center justify-center rounded-full bg-[#EAB308] active:opacity-80"
                        onPress={onSave}
                        disabled={!draftDate || saving}
                    >
                        <Text style={{ fontSize: isTiny ? 13 : 15 }} className="font-lufga-bold text-slate-950">
                            Save date
                        </Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
