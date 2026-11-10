import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, Check, X } from 'lucide-react-native';

const REASONS = [
    'Vehicle problem',
    'Customer not reachable',
    'Wrong or unclear address',
    'Order damaged',
    'Personal emergency',
    'Other',
];

type Props = {
    visible: boolean;
    orderLabel: string;
    busy: boolean;
    error?: string;
    onClose: () => void;
    onSubmit: (reason: string) => void;
};

/**
 * Bottom sheet where the rider picks why they're dropping a delivery. The
 * order isn't cancelled — the restaurant (and admin) decide what happens next.
 */
export function CancelDeliveryModal({ visible, orderLabel, busy, error, onClose, onSubmit }: Props) {
    const insets = useSafeAreaInsets();
    const [choice, setChoice] = useState<string | null>(null);
    const [details, setDetails] = useState('');
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (visible) {
            setChoice(null);
            setDetails('');
            setLocalError('');
        }
    }, [visible]);

    const submit = () => {
        if (!choice) {
            setLocalError('Select a reason');
            return;
        }
        const extra = details.trim();
        if (choice === 'Other' && extra.length < 5) {
            setLocalError('Please describe the reason');
            return;
        }
        onSubmit(extra ? `${choice} — ${extra}` : choice);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Pressable className="flex-1 bg-black/40" onPress={busy ? undefined : onClose} />
                <View
                    className="rounded-t-[32px] bg-white px-5 pt-3"
                    style={{ paddingBottom: insets.bottom + 20 }}
                >
                    <View className="mb-4 items-center">
                        <View className="h-1.5 w-12 rounded-full bg-slate-200" />
                    </View>

                    <View className="flex-row items-start">
                        <View className="h-11 w-11 items-center justify-center rounded-full bg-red-50">
                            <AlertTriangle size={20} color="#dc2626" />
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-lg font-bold text-slate-950">Cancel delivery?</Text>
                            <Text className="mt-0.5 text-sm text-slate-500">
                                Order {orderLabel} goes back to the restaurant. They&apos;ll decide whether to
                                assign another rider or cancel it.
                            </Text>
                        </View>
                        <Pressable
                            onPress={onClose}
                            disabled={busy}
                            className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
                        >
                            <X size={18} color="#334155" />
                        </Pressable>
                    </View>

                    <Text className="mb-2 mt-5 text-sm font-semibold text-slate-800">Reason</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {REASONS.map((r) => {
                            const selected = choice === r;
                            return (
                                <Pressable
                                    key={r}
                                    onPress={() => {
                                        setChoice(r);
                                        setLocalError('');
                                    }}
                                    className={`flex-row items-center rounded-full border px-3.5 py-2 ${selected ? 'border-[#EAB308] bg-amber-50' : 'border-slate-200 bg-white'}`}
                                >
                                    {selected ? <Check size={14} color="#b77900" style={{ marginRight: 4 }} /> : null}
                                    <Text className={`text-sm ${selected ? 'font-semibold text-amber-800' : 'text-slate-700'}`}>
                                        {r}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <TextInput
                        value={details}
                        onChangeText={(t) => {
                            setDetails(t);
                            setLocalError('');
                        }}
                        placeholder={choice === 'Other' ? 'Describe the reason (required)' : 'Add details (optional)'}
                        placeholderTextColor="#94a3b8"
                        multiline
                        maxLength={200}
                        className="mt-3 min-h-[72px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
                        style={{ textAlignVertical: 'top' }}
                    />

                    {localError || error ? (
                        <Text className="mt-2 text-sm text-red-600">{localError || error}</Text>
                    ) : null}

                    <View className="mt-5 flex-row gap-3">
                        <Pressable
                            onPress={onClose}
                            disabled={busy}
                            className="h-12 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white active:opacity-70"
                        >
                            <Text className="text-sm font-bold text-slate-700">Keep delivery</Text>
                        </Pressable>
                        <Pressable
                            onPress={submit}
                            disabled={busy}
                            className="h-12 flex-1 flex-row items-center justify-center rounded-full bg-red-600 active:opacity-80"
                        >
                            {busy ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text className="text-sm font-bold text-white">Cancel delivery</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
