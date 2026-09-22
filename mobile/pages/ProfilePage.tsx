import { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
    useWindowDimensions,
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
import { logoutCurrentSession } from '@/api/auth/auth.service';
import { ProfileSettingCard } from '@/components/reusable/ProfileSettingCard';

type ProfilePageProps = {
    onLogout?: () => void;
    onBack?: () => void;
    onOrderHistory?: () => void;
    onEditProfile?: () => void;
    onChangePassword?: () => void;
    onSecurity?: () => void;
    onTheme?: () => void;
};

export function ProfilePage({
    onLogout,
    onBack,
    onOrderHistory,
    onEditProfile,
    onChangePassword,
    onSecurity,
    onTheme,
}: ProfilePageProps) {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;
    const isTinyScreen = width < 340;

    const heroPaddingX = isTinyScreen ? 'px-4' : isSmallScreen ? 'px-5' : 'px-6';
    const heroPaddingTop = isTinyScreen ? 'pt-6' : isSmallScreen ? 'pt-7' : 'pt-8';
    const heroPaddingBottom = isTinyScreen ? 'pb-5' : isSmallScreen ? 'pb-6' : 'pb-7';
    const avatarSize = isTinyScreen ? 'h-20 w-20' : isSmallScreen ? 'h-24 w-24' : 'h-28 w-28';
    const avatarBorder = isTinyScreen ? 'border-2' : isSmallScreen ? 'border-3' : 'border-4';
    const nameSize = isTinyScreen ? 'text-xl' : isSmallScreen ? 'text-2xl' : 'text-2xl';
    const subtextSize = isTinyScreen ? 'text-[11px]' : isSmallScreen ? 'text-xs' : 'text-sm';
    const addressBadgePx = isTinyScreen ? 'px-2.5' : isSmallScreen ? 'px-3' : 'px-4';
    const addressBadgePy = isTinyScreen ? 'py-1.5' : isSmallScreen ? 'py-1.5' : 'py-2';
    const addressTextSize = isTinyScreen
        ? 'text-[10px]'
        : isSmallScreen
          ? 'text-[11px]'
          : 'text-xs';
    const headerTitleSize = isTinyScreen ? 'text-lg' : isSmallScreen ? 'text-xl' : 'text-2xl';
    const headerPaddingX = isTinyScreen ? 'px-3' : isSmallScreen ? 'px-4' : 'px-5';
    const sectionPaddingX = isTinyScreen ? 'mx-3' : isSmallScreen ? 'mx-4' : 'mx-5';
    const backBtnSize = isTinyScreen ? 'h-9 w-9' : isSmallScreen ? 'h-10 w-10' : 'h-11 w-11';
    const backBtnRadius = isTinyScreen ? 'rounded-xl' : 'rounded-2xl';
    const backIconSize = isTinyScreen ? 20 : isSmallScreen ? 21 : 23;
    const backIconSizeAlt = isTinyScreen ? 19 : isSmallScreen ? 20 : 22;
    const backBtnSizeAlt = isTinyScreen
        ? 'h-8.5 w-8.5'
        : isSmallScreen
          ? 'h-9.5 w-9.5'
          : 'h-10 w-10';
    const backBtnRadiusAlt = isTinyScreen ? 'rounded-xl' : 'rounded-full';

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
        try {
            await logoutCurrentSession();
        } catch {
            // Local logout still clears the account if the server is unreachable.
        }
        await logout();
        onLogout?.();
    };

    const handlePickAvatar = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(
                'Permission needed',
                'Allow photo library access to set your profile picture.'
            );
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
    const initials = name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header */}
                <View className={`flex-row items-center ${headerPaddingX} pb-2 pt-2 min-w-0`}>
                    {onBack && (
                        <Pressable
                            className={`${backBtnSize} ${backBtnRadius} shrink-0 items-center justify-center bg-white/60 active:opacity-60`}
                            onPress={onBack}
                        >
                            <ChevronLeft size={backIconSize} color="#171717" />
                        </Pressable>
                    )}
                    <Text
                        className={`ml-3 flex-1 ${headerTitleSize} font-lufga-bold text-slate-950`}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        My Profile
                    </Text>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {/* Hero card with gradient avatar */}
                    <View
                        className={`${sectionPaddingX} mt-2 overflow-hidden rounded-[28px] bg-[#1D1D1D] shadow-sm shadow-slate-300`}
                    >
                        <View className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-amber-400/20" />
                        <View className="absolute -left-12 -bottom-24 h-40 w-40 rounded-full bg-amber-500/10" />
                        <View
                            className={`items-center ${heroPaddingX} ${heroPaddingBottom} ${heroPaddingTop} min-w-0`}
                        >
                            <Pressable
                                className="relative active:opacity-80 shrink-0"
                                onPress={handlePickAvatar}
                                disabled={uploadAvatar.isPending}
                            >
                                <View
                                    className={`${avatarSize} items-center justify-center overflow-hidden rounded-full ${avatarBorder} border-amber-400/70 bg-slate-800`}
                                >
                                    {avatarUri ? (
                                        <Image
                                            source={{ uri: avatarUri }}
                                            className="h-full w-full"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Text
                                            className={`${isTinyScreen ? 'text-2xl' : isSmallScreen ? 'text-2xl' : 'text-3xl'} font-lufga-bold text-amber-300`}
                                        >
                                            {initials}
                                        </Text>
                                    )}
                                </View>
                                {uploadAvatar.isPending ? (
                                    <View className="absolute bottom-0 right-0 h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400">
                                        <Text className="text-xs font-lufga-bold text-slate-900">
                                            …
                                        </Text>
                                    </View>
                                ) : (
                                    <View className="absolute bottom-0 right-0 h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400">
                                        <Camera size={15} color="#171717" />
                                    </View>
                                )}
                            </Pressable>
                            <Text
                                className={`mt-4 ${nameSize} font-lufga-bold text-white`}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {name}
                            </Text>
                            <Text
                                className={`mt-1 ${subtextSize} font-lufga text-slate-300 min-w-0`}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {email !== '—' ? email : phone}
                            </Text>
                            <View
                                className={`mt-4 flex-row items-center rounded-full bg-white/10 ${addressBadgePx} ${addressBadgePy} max-w-full`}
                            >
                                <MapPin size={14} color="#FCD34D" className="shrink-0" />
                                <Text
                                    className={`ml-2 ${addressTextSize} font-lufga-medium text-slate-200 flex-1 min-w-0`}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {address}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Settings */}
                    <View className={`${sectionPaddingX} mt-5`}>
                        <Text className="mb-3 text-base font-lufga-semibold text-slate-950">
                            General
                        </Text>

                        <ProfileSettingCard
                            icon={<UserRound size={18} color="#b77900" />}
                            label="Edit Profile"
                            onPress={onEditProfile}
                        />
                        <ProfileSettingCard
                            icon={<LockKeyhole size={18} color="#b77900" />}
                            label="Change Password"
                            onPress={onChangePassword}
                        />
                        <ProfileSettingCard
                            icon={<Bell size={18} color="#b77900" />}
                            label="Notifications"
                        />
                        <ProfileSettingCard
                            icon={<Shield size={18} color="#b77900" />}
                            label="Security"
                            onPress={onSecurity}
                        />
                        <ProfileSettingCard
                            icon={<Sun size={18} color="#b77900" />}
                            label="Theme"
                            onPress={onTheme}
                        />
                        <ProfileSettingCard
                            icon={<Languages size={18} color="#b77900" />}
                            label="Language"
                        />
                        <ProfileSettingCard
                            icon={<Star size={18} color="#b77900" />}
                            label="My Reviews"
                        />
                        <ProfileSettingCard
                            icon={<CreditCard size={18} color="#b77900" />}
                            label="Payment Methods"
                        />
                        <ProfileSettingCard
                            icon={<MapPin size={18} color="#b77900" />}
                            label="Address"
                            onPress={() => setShowAddressManager(true)}
                        />
                    </View>

                    {/* Logout */}
                    <View className={`${sectionPaddingX} mt-5 mb-3`}>
                        <Pressable
                            className={`flex-row items-center justify-center rounded-2xl bg-red-50 ${isTinyScreen ? 'py-3' : 'py-4'} active:opacity-70`}
                            onPress={handleLogout}
                        >
                            <LogOut size={20} color="#ef4444" className="shrink-0" />
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
                <Modal
                    visible
                    animationType="slide"
                    onRequestClose={() => setShowAddressManager(false)}
                >
                    <AppBackground>
                        <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                            <View
                                className={`flex-row items-center ${sectionPaddingX} pt-2 pb-4 min-w-0`}
                            >
                                <Pressable
                                    className={`${backBtnSizeAlt} ${backBtnRadiusAlt} shrink-0 items-center justify-center bg-white/70 active:opacity-60 mr-3`}
                                    onPress={() => setShowAddressManager(false)}
                                >
                                    <ChevronLeft size={backIconSizeAlt} color="#1e293b" />
                                </Pressable>
                                <Text
                                    className={`flex-1 ${headerTitleSize} font-lufga-bold text-slate-900`}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    My Addresses
                                </Text>
                            </View>
                            <View className={`flex-1 ${sectionPaddingX}`}>
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
        <View
            className={`flex-row items-center px-4 py-4 ${last ? '' : 'border-b border-slate-100'} min-w-0`}
        >
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                {icon}
            </View>
            <View className="ml-3 flex-1 min-w-0">
                <Text className="text-xs font-lufga text-slate-400">{label}</Text>
                <Text
                    className="mt-0.5 font-lufga-semibold text-slate-950"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {value}
                </Text>
            </View>
            {action && <View className="shrink-0">{action}</View>}
        </View>
    );
}

function ActionRow({
    icon,
    label,
    last,
    onPress,
    card,
}: {
    icon: React.ReactNode;
    label: string;
    last?: boolean;
    onPress?: () => void;
    card?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            className={`flex-row items-center px-4 ${card ? 'mb-2 rounded-2xl bg-white py-3 shadow-sm shadow-slate-200' : `py-4 active:bg-slate-50 ${last ? '' : 'border-b border-slate-100'}`} min-w-0`}
        >
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                {icon}
            </View>
            <Text
                className="ml-3 flex-1 font-lufga-semibold text-slate-950"
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {label}
            </Text>
            <ChevronRight size={18} color="#cbd5e1" className="shrink-0" />
        </Pressable>
    );
}
