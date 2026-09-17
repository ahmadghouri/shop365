import { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
    Bell,
    Camera,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Languages,
    LockKeyhole,
    LogOut,
    MapPin,
    Phone,
    Shield,
    Star,
    Sun,
    UserRound,
} from 'lucide-react-native';
import { useAuthStore } from '@/lib/authStore';
import { AppBackground } from '@/components/AppBackground';
import { LocationPickerModal } from '@/components/LocationPickerModal';
import { LocationAddressManager } from '@/components/LocationAddressManager';
import { useUpdateAvatarMutation } from '@/api/users/useUpdateAvatarMutation';

type ProfilePageProps = {
    onLogout?: () => void;
    onBack?: () => void;
    onOrderHistory?: () => void;
    onEditProfile?: () => void;
};

export function ProfilePage({ onLogout, onBack, onOrderHistory, onEditProfile }: ProfilePageProps) {
    const { user, updateUser, logout } = useAuthStore();
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [showAddressManager, setShowAddressManager] = useState(false);
    const uploadAvatar = useUpdateAvatarMutation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        setShowLogoutConfirm(false);
        await logout();
        onLogout?.();
    };

    const handlePickAvatar = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission needed', 'Allow photo library access to set your profile picture.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (result.canceled || !result.assets?.length) return;

        // Preview immediately, then persist to the backend
        const localUri = result.assets[0].uri;
        const prevImage = user?.image;
        try {
            await updateUser({ image: localUri });
        } catch {
            // preview only
        }

        const userId = user?._id || user?.id;
        if (userId) {
            try {
                await uploadAvatar.mutateAsync({ userId, imageUri: localUri });
            } catch {
                // keep the local preview but flag failure
                Alert.alert('Upload failed', 'Your photo could not be saved to the server.');
                if (prevImage) await updateUser({ image: prevImage });
            }
        }
    };

    const name = user?.name || 'User';
    const phone = user?.phone || user?.phone_number || user?.phone_no || '—';
    const email = user?.email || '—';
    const address = user?.address || user?.location?.address || 'Not set';
    const avatarUri = user?.image;
    const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header */}
                <View className="flex-row items-center px-5 pb-2 pt-2">
                    {onBack && (
                        <Pressable className="h-11 w-11 items-center justify-center rounded-2xl bg-white/60 active:opacity-60" onPress={onBack}>
                            <ChevronLeft size={23} color="#171717" />
                        </Pressable>
                    )}
                    <Text className="ml-3 text-2xl font-lufga-bold text-slate-950">My Profile</Text>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {/* Hero card with gradient avatar */}
                    <View className="mx-5 mt-2 overflow-hidden rounded-[28px] bg-[#1D1D1D] shadow-sm shadow-slate-300">
                        <View className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-amber-400/20" />
                        <View className="absolute -left-12 -bottom-24 h-40 w-40 rounded-full bg-amber-500/10" />
                        <View className="items-center px-6 pb-7 pt-8">
                            <Pressable
                                className="relative active:opacity-80"
                                onPress={handlePickAvatar}
                                disabled={uploadAvatar.isPending}
                            >
                                <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-amber-400/70 bg-slate-800">
                                    {avatarUri ? (
                                        <Image source={{ uri: avatarUri }} className="h-full w-full" resizeMode="cover" />
                                    ) : (
                                        <Text className="text-3xl font-lufga-bold text-amber-300">{initials}</Text>
                                    )}
                                </View>
                                {uploadAvatar.isPending ? (
                                    <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-amber-400">
                                        <Text className="text-xs font-lufga-bold text-slate-900">…</Text>
                                    </View>
                                ) : (
                                    <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-amber-400">
                                        <Camera size={15} color="#171717" />
                                    </View>
                                )}
                            </Pressable>
                            <Text className="mt-4 text-2xl font-lufga-bold text-white">{name}</Text>
                            <Text className="mt-1 text-sm font-lufga text-slate-300">
                                {email !== '—' ? email : phone}
                            </Text>
                            <View className="mt-4 flex-row items-center rounded-full bg-white/10 px-4 py-2">
                                <MapPin size={14} color="#FCD34D" />
                                <Text className="ml-2 text-xs font-lufga-medium text-slate-200" numberOfLines={1}>
                                    {address}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Settings */}
                    <View className="mx-5 mt-5">
                        <Text className="mb-3 text-base font-lufga-semibold text-slate-950">General</Text>

                        <ActionRow card icon={<UserRound size={18} color="#171717" />} label="Edit Profile" onPress={onEditProfile} />
                        <ActionRow card icon={<LockKeyhole size={18} color="#171717" />} label="Change Password" />
                        <ActionRow card icon={<Bell size={18} color="#171717" />} label="Notifications" />
                        <ActionRow card icon={<Shield size={18} color="#171717" />} label="Security" />
                        <ActionRow card icon={<Sun size={18} color="#171717" />} label="Theme" />
                        <ActionRow card icon={<Languages size={18} color="#171717" />} label="Language" />
                        <ActionRow card icon={<Star size={18} color="#171717" />} label="My Reviews" />
                        <ActionRow card icon={<CreditCard size={18} color="#171717" />} label="Payment Methods" />
                        <ActionRow
                            card
                            icon={<MapPin size={18} color="#171717" />}
                            label="Address"
                            onPress={() => setShowAddressManager(true)}
                            last
                        />
                    </View>

                    {/* Logout */}
                    <View className="mx-5 mt-5 mb-3">
                        <Pressable
                            className="flex-row items-center justify-center rounded-2xl bg-red-50 py-4 active:opacity-70"
                            onPress={handleLogout}
                        >
                            <LogOut size={20} color="#ef4444" />
                            <Text className="ml-2 font-lufga-bold text-red-600">Logout</Text>
                        </Pressable>
                    </View>

                    {/* App version */}
                    <View className="items-center pb-2 pt-2">
                        <Text className="text-xs font-lufga text-slate-300">SHOP365 · v1.0.0</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>

            <LocationPickerModal visible={showMapPicker} onClose={() => setShowMapPicker(false)} />

            <Modal
                visible={showLogoutConfirm}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLogoutConfirm(false)}
            >
                <Pressable
                    className="flex-1 items-center justify-center bg-black/50 px-6"
                    onPress={() => setShowLogoutConfirm(false)}
                >
                    <Pressable
                        className="w-full max-w-md rounded-3xl bg-white p-6"
                        onPress={(event) => event.stopPropagation()}
                    >
                        <Text className="text-2xl font-lufga-bold text-slate-900">Logout?</Text>
                        <Text className="mt-2 text-base leading-6 font-lufga text-slate-500">
                            Are you sure you want to logout from your account?
                        </Text>
                        <View className="mt-6 flex-row gap-3">
                            <Pressable
                                className="flex-1 items-center justify-center rounded-full border border-slate-200 py-3 active:opacity-70"
                                onPress={() => setShowLogoutConfirm(false)}
                            >
                                <Text className="font-lufga-semibold text-slate-700">Cancel</Text>
                            </Pressable>
                            <Pressable
                                className="flex-1 items-center justify-center rounded-full bg-red-500 py-3 active:opacity-80"
                                onPress={confirmLogout}
                            >
                                <Text className="font-lufga-semibold text-white">Logout</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Address Manager Modal */}
            {showAddressManager && (
                <Modal visible animationType="slide" onRequestClose={() => setShowAddressManager(false)}>
                    <AppBackground>
                        <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                            <View className="flex-row items-center px-5 pt-2 pb-4">
                                <Pressable
                                    className="h-10 w-10 items-center justify-center rounded-full bg-white/70 active:opacity-60 mr-3"
                                    onPress={() => setShowAddressManager(false)}
                                >
                                    <ChevronLeft size={22} color="#1e293b" />
                                </Pressable>
                                <Text className="text-2xl font-lufga-bold text-slate-900">My Addresses</Text>
                            </View>
                            <View className="flex-1 px-5">
                                <LocationAddressManager />
                            </View>
                        </SafeAreaView>
                    </AppBackground>
                </Modal>
            )}
        </AppBackground>
    );
}

function ProfileRow({
    icon,
    label,
    value,
    last,
    action,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    last?: boolean;
    action?: React.ReactNode;
}) {
    return (
        <View className={`flex-row items-center px-4 py-4 ${last ? '' : 'border-b border-slate-100'}`}>
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-amber-50">
                {icon}
            </View>
            <View className="ml-3 flex-1">
                <Text className="text-xs font-lufga text-slate-400">{label}</Text>
                <Text className="mt-0.5 font-lufga-semibold text-slate-950" numberOfLines={2}>{value}</Text>
            </View>
            {action}
        </View>
    );
}

function ActionRow({ icon, label, last, onPress, card }: { icon: React.ReactNode; label: string; last?: boolean; onPress?: () => void; card?: boolean }) {
    return (
        <Pressable onPress={onPress} className={`flex-row items-center px-4 ${card ? 'mb-2 rounded-2xl bg-white py-3 shadow-sm shadow-slate-200' : `py-4 active:bg-slate-50 ${last ? '' : 'border-b border-slate-100'}`}`}>
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                {icon}
            </View>
            <Text className="ml-3 flex-1 font-lufga-semibold text-slate-950">{label}</Text>
            <ChevronRight size={18} color="#cbd5e1" />
        </Pressable>
    );
}
