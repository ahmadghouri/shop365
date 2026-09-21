import { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { type DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import { Camera, ChevronLeft, Save } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GradientPill } from '@/components/reusable/GradientPill';
import { updateUserProfile } from '@/api/users/user.service';
import { useAuthStore } from '@/lib/authStore';
import { useUpdateAvatarMutation } from '@/api/users/useUpdateAvatarMutation';
import {
    formatPakistanPhoneNumber,
    sanitizePakistanPhoneDigits,
    toPakistanE164,
    validatePakistanPhoneNumber,
} from '@/lib/pakistanPhone';

type EditProfilePageProps = {
    onBack: () => void;
};

function parseDateOfBirth(value: string): Date | null {
    const [month, day, year] = value.split('/').map(Number);
    if (!month || !day || !year) return null;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function formatDateOfBirth(date: Date): string {
    return [date.getMonth() + 1, date.getDate(), date.getFullYear()]
        .map((part, index) => index < 2 ? String(part).padStart(2, '0') : String(part))
        .join('/');
}

export function EditProfilePage({ onBack }: EditProfilePageProps) {
    const { user, updateUser } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(sanitizePakistanPhoneDigits(user?.phone_no || ''));
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || '');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(parseDateOfBirth(user?.date_of_birth || ''));
    const [saving, setSaving] = useState(false);
    const uploadAvatar = useUpdateAvatarMutation();
    const calendarStyles = useDefaultStyles();

    const handlePickAvatar = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (result.canceled || !result.assets?.length) return;
        const imageUri = result.assets[0].uri;
        await updateUser({ image: imageUri });
        const userId = user?._id || user?.id;
        if (userId) await uploadAvatar.mutateAsync({ userId, imageUri });
    };

    const handleSave = async () => {
        const userId = user?._id || user?.id;
        const validationError = validatePakistanPhoneNumber(phone);
        if (validationError) {
            setPhoneError(validationError);
            return;
        }
        if (!userId || !name.trim()) {
            Alert.alert('Missing information', 'Please enter your name and phone number.');
            return;
        }

        setSaving(true);
        try {
            const response = await updateUserProfile(userId, {
                name: name.trim(),
                email: email.trim(),
                phone_no: toPakistanE164(phone),
                date_of_birth: dateOfBirth.trim(),
            });
            await updateUser(response.user);
            onBack();
        } catch {
            Alert.alert('Update failed', 'Your profile could not be updated. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDateChange = ({ date }: { date: DateType }) => {
        if (!date) return;
        const nextDate = date instanceof Date
            ? date
            : typeof date === 'object' && 'toDate' in date
                ? date.toDate()
                : new Date(date as string);
        if (Number.isNaN(nextDate.getTime())) return;
        setSelectedDate(nextDate);
        setDateOfBirth(formatDateOfBirth(nextDate));
        setShowDatePicker(false);
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
                    <Text className="text-2xl font-lufga-bold text-slate-950">Edit Profile</Text>
                </View>

                <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
                    <View className="items-center pb-5 pt-2">
                        <Pressable className="relative" onPress={handlePickAvatar} disabled={uploadAvatar.isPending}>
                            <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                                {user?.image ? (
                                    <Image source={{ uri: user.image }} className="h-full w-full" resizeMode="cover" />
                                ) : (
                                    <Text className="text-3xl font-lufga-bold text-slate-500">{(name || 'U').slice(0, 1).toUpperCase()}</Text>
                                )}
                            </View>
                            <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-400">
                                <Camera size={15} color="#171717" />
                            </View>
                        </Pressable>
                    </View>

                    <View>
                        <Text className="mb-2 text-sm font-lufga-semibold text-slate-900">Full Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#94a3b8"
                            className="rounded-3xl bg-white px-4 py-4 text-base font-lufga text-slate-900 shadow-sm shadow-slate-200"
                        />

                        <Text className="mb-2 mt-4 text-sm font-lufga-semibold text-slate-900">Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor="#94a3b8"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="rounded-3xl bg-white px-4 py-4 text-base font-lufga text-slate-900 shadow-sm shadow-slate-200"
                        />

                        <Text className="mb-2 mt-4 text-sm font-lufga-semibold text-slate-900">Phone Number</Text>
                        <View className="flex-row items-center rounded-3xl bg-white px-4 py-1 shadow-sm shadow-slate-200">
                            <Text className="border-r border-slate-200 pr-3 text-base font-lufga-semibold text-slate-700">+92</Text>
                            <TextInput
                                value={formatPakistanPhoneNumber(phone).replace(/^\+92\s?/, '')}
                                onChangeText={(value) => {
                                    setPhone(sanitizePakistanPhoneDigits(value));
                                    setPhoneError(null);
                                }}
                                placeholder="300 1234567"
                                placeholderTextColor="#94a3b8"
                                keyboardType="phone-pad"
                                className="flex-1 px-3 py-3 text-base font-lufga text-slate-900"
                            />
                        </View>
                        {phoneError && <Text className="mt-1 px-2 text-sm font-lufga text-red-500">{phoneError}</Text>}

                        <Text className="mb-2 mt-4 text-sm font-lufga-semibold text-slate-900">Date of Birth</Text>
                        <Pressable
                            className="rounded-3xl bg-white px-4 py-4 shadow-sm shadow-slate-200"
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text className={`text-base font-lufga ${dateOfBirth ? 'text-slate-900' : 'text-slate-400'}`}>
                                {dateOfBirth || 'MM/DD/YYYY'}
                            </Text>
                        </Pressable>

                    </View>
                </ScrollView>
                <View className="px-5 pb-3 pt-2">
                    <GradientPill className="h-12 rounded-full">
                        <Pressable
                            className="flex-1 flex-row items-center justify-center active:opacity-80"
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Save size={18} color="#171717" />
                            <Text className="ml-2 text-base font-lufga-bold text-slate-950">{saving ? 'Saving...' : 'Save Changes'}</Text>
                        </Pressable>
                    </GradientPill>
                </View>
            </SafeAreaView>
            {showDatePicker && (
                <Modal
                    visible
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowDatePicker(false)}
                >
                    <Pressable className="flex-1 items-center justify-center bg-black/45 px-5" onPress={() => setShowDatePicker(false)}>
                        <Pressable className="w-full rounded-3xl bg-white p-5" onPress={(event) => event.stopPropagation()}>
                            <Text className="text-xl font-lufga-bold text-slate-950">Choose date of birth</Text>
                            <View className="mt-4">
                                <DateTimePicker
                                    mode="single"
                                    date={selectedDate || new Date(2000, 0, 1)}
                                    maxDate={new Date()}
                                    onChange={handleDateChange}
                                    styles={calendarStyles}
                                />
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
            )}
        </AppBackground>
    );
}