import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    Text,
    TextInput,
    Switch,
    View,
} from 'react-native';
import { Plus, X } from 'lucide-react-native';
import type { MonthlyGroceryCard } from '@/api/monthly-grocery/monthly-grocery.service';
import { useCreateMonthlyGroceryCard, useUpdateMonthlyGroceryCard } from '@/api/monthly-grocery/useMonthlyGroceryQueries';

type CreateMonthlyListModalProps = {
    visible: boolean;
    onClose: () => void;
    onCreated: (card: MonthlyGroceryCard) => void;
    editingCard?: MonthlyGroceryCard | null;
    onUpdated?: (card: MonthlyGroceryCard) => void;
};

export function CreateMonthlyListModal({ visible, onClose, onCreated, editingCard, onUpdated }: CreateMonthlyListModalProps) {
    const [newName, setNewName] = useState('');
    const [autoOrderEnabled, setAutoOrderEnabled] = useState(false);
    const createCard = useCreateMonthlyGroceryCard();
    const updateCard = useUpdateMonthlyGroceryCard();

    useEffect(() => {
        if (visible) {
            setNewName(editingCard?.name || '');
            setAutoOrderEnabled(editingCard?.auto_order_enabled || false);
        }
    }, [visible, editingCard]);

    const handleCreate = async () => {
        const name = newName.trim();
        if (!name) {
            Alert.alert('List name required', 'Please enter a name such as Monthly Home or Office Pantry.');
            return;
        }
        try {
            const card = editingCard
                ? await updateCard.mutateAsync({ cardId: editingCard._id, name, autoOrderEnabled })
                : await createCard.mutateAsync({ name, auto_order_enabled: autoOrderEnabled });
            setNewName('');
            onClose();
            if (editingCard) onUpdated?.(card);
            else onCreated(card);
        } catch (error: any) {
            Alert.alert('Could not create list', error?.response?.data?.message || 'Please try again.');
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
                <Pressable className="rounded-t-[32px] bg-white px-5 pb-9 pt-4" onPress={() => { }}>
                    <View className="mb-6 flex-row items-center justify-between">
                        <View>
                            <Text className="text-2xl font-lufga-bold text-slate-950">{editingCard ? 'Edit List' : 'Create New List'}</Text>
                                <Text className="mt-1 text-sm font-lufga text-slate-400">{editingCard ? 'Update your grocery package name' : 'Give your grocery package a name'}</Text>
                        </View>
                        <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-slate-100" onPress={onClose}>
                            <X size={19} color="#334155" />
                        </Pressable>
                    </View>
                    <Text className="mb-2 text-sm font-lufga-semibold text-slate-700">List name</Text>
                    <TextInput
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-lufga text-slate-950"
                        value={newName}
                        onChangeText={setNewName}
                        placeholder="e.g. Monthly Home, Office Pantry"
                        placeholderTextColor="#94a3b8"
                        maxLength={50}
                        autoCapitalize="words"
                    />
                    <View className="mt-5 flex-row items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
                        <View className="flex-1 pr-3">
                            <Text className="font-lufga-semibold text-slate-900">Auto-order this list</Text>
                            <Text className="mt-1 text-xs leading-4 font-lufga text-slate-500">
                                Keep this list ready for automatic ordering.
                            </Text>
                        </View>
                        <Switch
                            value={autoOrderEnabled}
                            onValueChange={setAutoOrderEnabled}
                            trackColor={{ false: '#cbd5e1', true: '#FCD34D' }}
                            thumbColor={autoOrderEnabled ? '#171717' : '#f8fafc'}
                        />
                    </View>
                    <Pressable
                        disabled={createCard.isPending || updateCard.isPending}
                        className="mt-6 flex-row items-center justify-center rounded-full bg-[#FFC400] py-4 disabled:opacity-60"
                        onPress={handleCreate}
                    >
                        {createCard.isPending || updateCard.isPending ? <ActivityIndicator color="#171717" /> : (
                            <>
                                <Plus size={19} color="#171717" />
                                <Text className="ml-2 font-lufga-bold text-slate-950">{editingCard ? 'Save Changes' : 'Create List'}</Text>
                            </>
                        )}
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
