import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, LockKeyhole, Save } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GradientPill } from '@/components/reusable/GradientPill';
import { changePassword } from '@/api/auth/auth.service';
import { useAuthStore } from '@/lib/authStore';

type ChangePasswordPageProps = {
    onBack: () => void;
};

export function ChangePasswordPage({ onBack }: ChangePasswordPageProps) {
    const user = useAuthStore((state) => state.user);
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!user?.phone_no || !currentPassword || password.length < 4) {
            Alert.alert('Invalid password', 'Password must be at least 4 characters.');
            return;
        }
        if (password !== confirmation) {
            Alert.alert('Passwords do not match', 'Please enter the same password in both fields.');
            return;
        }

        setSaving(true);
        try {
            await changePassword(currentPassword, password);
            Alert.alert('Password Updated', 'Your password has been changed successfully.', [
                { text: 'Okay', onPress: onBack },
            ]);
        } catch {
            Alert.alert('Update failed', 'Your password could not be changed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right', 'bottom']}>
                <View className="flex-row items-center px-5 pb-4 pt-2">
                    <Pressable
                        className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-white/70 active:opacity-60"
                        onPress={onBack}
                    >
                        <ChevronLeft size={23} color="#171717" />
                    </Pressable>
                    <Text className="text-2xl font-lufga-bold text-slate-950">Change Password</Text>
                </View>

                <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
                    <View className="items-center pb-5 pt-5">
                        <View className="h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                            <LockKeyhole size={32} color="#b77900" />
                        </View>
                        <Text className="mt-4 text-center text-sm font-lufga text-slate-500">
                            Create a new password for your account.
                        </Text>
                    </View>

                    <Text className="mb-2 text-sm font-lufga-semibold text-slate-900">Old Password</Text>
                    <TextInput
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="Enter old password"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry
                        autoCapitalize="none"
                        className="rounded-3xl bg-white px-4 py-4 text-base font-lufga text-slate-900 shadow-sm shadow-slate-200"
                    />

                    <Text className="mb-2 mt-4 text-sm font-lufga-semibold text-slate-900">New Password</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter new password"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry
                        autoCapitalize="none"
                        className="rounded-3xl bg-white px-4 py-4 text-base font-lufga text-slate-900 shadow-sm shadow-slate-200"
                    />

                    <Text className="mb-2 mt-4 text-sm font-lufga-semibold text-slate-900">Confirm Password</Text>
                    <TextInput
                        value={confirmation}
                        onChangeText={setConfirmation}
                        placeholder="Confirm new password"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry
                        autoCapitalize="none"
                        className="rounded-3xl bg-white px-4 py-4 text-base font-lufga text-slate-900 shadow-sm shadow-slate-200"
                    />
                </ScrollView>

                <View className="px-5 pb-3 pt-2">
                    <GradientPill className="h-12 rounded-full">
                        <Pressable
                            className="flex-1 flex-row items-center justify-center active:opacity-80"
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Save size={18} color="#171717" />
                            <Text className="ml-2 text-base font-lufga-bold text-slate-950">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Text>
                        </Pressable>
                    </GradientPill>
                </View>
            </SafeAreaView>
        </AppBackground>
    );
}