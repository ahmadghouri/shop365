import { useState, type ReactNode } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import {
    BadgeCheck,
    Bike,
    Calendar,
    Camera,
    Car,
    ChevronRight,
    CreditCard,
    Eye,
    EyeOff,
    HelpCircle,
    KeyRound,
    LogOut,
    Package,
    Phone,
    Star,
    Store,
    X,
} from 'lucide-react-native';
import { GlassCard } from '@/components/reusable/GlassCard';
import { GradientPill } from '@/components/reusable/GradientPill';
import { BOTTOM_NAV_SPACE } from '@/components/reusable/BottomNav';
import { useAuthStore } from '@/lib/authStore';
import { useChangePassword, useRiderProfile, useUpdatePhoto } from '@/lib/riderProfile';

const maskCnic = (cnic?: string) => {
    if (!cnic) return '—';
    const d = cnic.replace(/\D/g, '');
    if (d.length !== 13) return cnic;
    return `${d.slice(0, 5)}-•••••${d.slice(10, 12)}-${d.slice(12)}`;
};

const memberSince = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString([], { month: 'short', year: 'numeric' }) : '—';

/** Rider's profile: identity, stats, vehicle, reviews, password and logout. */
export function RiderProfilePage() {
    const storedRider = useAuthStore((s) => s.rider);
    const logout = useAuthStore((s) => s.logout);
    const profile = useRiderProfile();
    const updatePhoto = useUpdatePhoto();
    const [showPassword, setShowPassword] = useState(false);

    const p = profile.data;
    const name = p?.name || storedRider?.name || 'Rider';
    const image = p?.image || storedRider?.image;
    const VehicleIcon = p?.vehicle_type === 'car' ? Car : Bike;

    const pickPhoto = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert('Permission needed', 'Allow photo access to change your picture.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.6,
        });
        if (result.canceled || !result.assets?.length) return;
        updatePhoto.mutate(result.assets[0].uri, {
            onError: (err: any) =>
                Alert.alert('Could not update photo', err?.response?.data?.message || 'Please try again.'),
        });
    };

    const confirmLogout = () =>
        Alert.alert('Log out?', 'You will need your phone number and password to log in again.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log out', style: 'destructive', onPress: logout },
        ]);

    return (
        <>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: BOTTOM_NAV_SPACE }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={profile.isRefetching}
                        onRefresh={() => {
                            profile.refetch();
                        }}
                        tintColor="#EAB308"
                        colors={['#EAB308']}
                    />
                }
            >
                {/* Header */}
                <View className="items-center px-5 pt-6">
                    <View>
                        <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-amber-50">
                            {image ? (
                                <Image source={{ uri: image }} className="h-28 w-28" resizeMode="cover" />
                            ) : (
                                <Text className="text-4xl font-bold text-[#b77900]">{name[0]?.toUpperCase()}</Text>
                            )}
                            {updatePhoto.isPending ? (
                                <View className="absolute inset-0 items-center justify-center bg-black/40">
                                    <ActivityIndicator color="#fff" />
                                </View>
                            ) : null}
                        </View>
                        <Pressable
                            onPress={pickPhoto}
                            disabled={updatePhoto.isPending}
                            className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-950 active:opacity-80"
                        >
                            <Camera size={16} color="#EAB308" />
                        </Pressable>
                    </View>

                    <View className="mt-3 flex-row items-center">
                        <Text className="text-2xl font-bold text-slate-950">{name}</Text>
                        {p?.status === 'active' ? <BadgeCheck size={20} color="#EAB308" style={{ marginLeft: 6 }} /> : null}
                    </View>
                    <Text className="mt-0.5 text-sm text-slate-500">{p?.phone_no || storedRider?.phone_no}</Text>

                    {p ? (
                        <View className="mt-3 flex-row items-center rounded-full bg-white/70 px-3 py-1.5">
                            {p.rider_type === 'restaurant' ? <Store size={14} color="#b77900" /> : <Bike size={14} color="#b77900" />}
                            <Text className="ml-1.5 text-xs font-semibold text-slate-800">
                                {p.rider_type === 'restaurant' ? `Rider · ${p.business?.name || 'Restaurant'}` : 'Platform rider'}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Stats */}
                <View className="mx-5 mt-6 flex-row gap-3">
                    <Stat icon={<Package size={17} color="#b77900" />} value={p ? `${p.stats.deliveries}` : '—'} label="Deliveries" />
                    <Stat
                        icon={<Star size={17} color="#EAB308" fill="#EAB308" />}
                        value={p ? (p.stats.reviews ? p.stats.rating.toFixed(1) : 'New') : '—'}
                        label={p?.stats.reviews ? `${p.stats.reviews} review${p.stats.reviews === 1 ? '' : 's'}` : 'Rating'}
                    />
                    <Stat icon={<Calendar size={17} color="#b77900" />} value={memberSince(p?.stats.member_since)} label="Rider since" />
                </View>

                {profile.isLoading ? <ActivityIndicator className="mt-8" color="#EAB308" /> : null}

                {/* Vehicle & documents */}
                {p ? (
                    <>
                        <SectionTitle>Vehicle & documents</SectionTitle>
                        <GlassCard className="mx-5 rounded-[24px] p-0">
                            <InfoRow
                                icon={<VehicleIcon size={18} color="#b77900" />}
                                label="Vehicle"
                                value={`${p.vehicle_type === 'car' ? 'Car' : 'Bike'}${p.vehicle_no ? ` · ${p.vehicle_no}` : ''}`}
                            />
                            <InfoRow icon={<CreditCard size={18} color="#b77900" />} label="CNIC" value={maskCnic(p.cnic)} divider />
                            {p.license_no ? (
                                <InfoRow icon={<BadgeCheck size={18} color="#b77900" />} label="License" value={p.license_no} divider />
                            ) : null}
                            <InfoRow icon={<Phone size={18} color="#b77900" />} label="Phone" value={p.phone_no} divider />
                        </GlassCard>
                        <Text className="mx-6 mt-2 text-xs text-slate-500">
                            To change these details, contact {p.rider_type === 'restaurant' ? 'your restaurant' : 'the admin'}.
                        </Text>

                        {/* Reviews */}
                        {p.recent_reviews.length ? (
                            <>
                                <SectionTitle>What customers say</SectionTitle>
                                {p.recent_reviews.map((r) => (
                                    <GlassCard key={r._id} className="mx-5 mb-2.5 rounded-[22px] p-4">
                                        <View className="flex-row items-center justify-between">
                                            <Text className="text-sm font-semibold text-slate-900">{r.customer}</Text>
                                            <View className="flex-row">
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <Star
                                                        key={n}
                                                        size={13}
                                                        color="#EAB308"
                                                        fill={n <= r.rating ? '#EAB308' : 'transparent'}
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                        {r.comments ? <Text className="mt-1 text-sm text-slate-600">{r.comments}</Text> : null}
                                        <Text className="mt-1 text-[11px] text-slate-400">
                                            {new Date(r.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                        </Text>
                                    </GlassCard>
                                ))}
                            </>
                        ) : null}
                    </>
                ) : null}

                {/* Account */}
                <SectionTitle>Account</SectionTitle>
                <GlassCard className="mx-5 rounded-[24px] p-0">
                    <MenuRow icon={<KeyRound size={18} color="#b77900" />} label="Change password" onPress={() => setShowPassword(true)} />
                    <MenuRow
                        icon={<HelpCircle size={18} color="#b77900" />}
                        label="Help & support"
                        onPress={() =>
                            Alert.alert(
                                'Help & support',
                                p?.rider_type === 'restaurant'
                                    ? `For help with deliveries or your account, contact ${p.business?.name || 'your restaurant'}.`
                                    : 'For help with deliveries or your account, contact the Shop365 admin.'
                            )
                        }
                        divider
                    />
                </GlassCard>

                <Pressable onPress={confirmLogout} className="mx-5 mt-4 active:opacity-80">
                    <View className="h-12 flex-row items-center justify-center rounded-full border border-red-200 bg-red-50">
                        <LogOut size={18} color="#dc2626" />
                        <Text className="ml-2 text-sm font-bold text-red-600">Log out</Text>
                    </View>
                </Pressable>

                <Text className="mt-4 text-center text-[11px] text-slate-400">
                    Rider App v{Constants.expoConfig?.version || '1.0.0'}
                </Text>
            </ScrollView>

            <ChangePasswordSheet visible={showPassword} onClose={() => setShowPassword(false)} />
        </>
    );
}

/* ---------------- pieces ---------------- */

function SectionTitle({ children }: { children: ReactNode }) {
    return <Text className="mx-5 mb-2 mt-6 text-sm font-bold text-slate-900">{children}</Text>;
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
    return (
        <GlassCard className="flex-1 items-center rounded-[22px] px-2 py-3.5">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-amber-50">{icon}</View>
            <Text className="mt-2 text-base font-bold text-slate-950" numberOfLines={1} adjustsFontSizeToFit>
                {value}
            </Text>
            <Text className="text-[11px] text-slate-500" numberOfLines={1}>
                {label}
            </Text>
        </GlassCard>
    );
}

function InfoRow({ icon, label, value, divider }: { icon: ReactNode; label: string; value: string; divider?: boolean }) {
    return (
        <View className={`flex-row items-center px-4 py-3.5 ${divider ? 'border-t border-white' : ''}`}>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-amber-50">{icon}</View>
            <Text className="ml-3 flex-1 text-sm text-slate-500">{label}</Text>
            <Text className="text-sm font-semibold text-slate-900">{value}</Text>
        </View>
    );
}

function MenuRow({ icon, label, onPress, divider }: { icon: ReactNode; label: string; onPress: () => void; divider?: boolean }) {
    return (
        <Pressable
            onPress={onPress}
            className={`flex-row items-center px-4 py-3.5 active:opacity-70 ${divider ? 'border-t border-white' : ''}`}
        >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-amber-50">{icon}</View>
            <Text className="ml-3 flex-1 text-sm font-semibold text-slate-900">{label}</Text>
            <ChevronRight size={18} color="#94a3b8" />
        </Pressable>
    );
}

function ChangePasswordSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const insets = useSafeAreaInsets();
    const change = useChangePassword();
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');

    const reset = () => {
        setCurrent('');
        setNext('');
        setConfirm('');
        setError('');
        setShow(false);
        change.reset();
    };
    const close = () => {
        reset();
        onClose();
    };

    const submit = () => {
        setError('');
        if (!current) return setError('Enter your current password.');
        if (next.length < 6) return setError('New password must be at least 6 characters.');
        if (next !== confirm) return setError("New passwords don't match.");
        change.mutate(
            { current_password: current, new_password: next },
            {
                onSuccess: () => {
                    close();
                    Alert.alert('Password changed', 'Use your new password next time you log in.');
                },
                onError: (err: any) => setError(err?.response?.data?.message || 'Could not change password.'),
            }
        );
    };

    const field = (value: string, onChange: (t: string) => void, placeholder: string) => (
        <TextInput
            value={value}
            onChangeText={(t) => {
                onChange(t);
                setError('');
            }}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            secureTextEntry={!show}
            autoCapitalize="none"
            className="mt-3 h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900"
        />
    );

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Pressable className="flex-1 bg-black/40" onPress={change.isPending ? undefined : close} />
                <View className="rounded-t-[32px] bg-white px-5 pt-3" style={{ paddingBottom: insets.bottom + 20 }}>
                    <View className="mb-4 items-center">
                        <View className="h-1.5 w-12 rounded-full bg-slate-200" />
                    </View>
                    <View className="flex-row items-center">
                        <View className="h-11 w-11 items-center justify-center rounded-full bg-amber-50">
                            <KeyRound size={20} color="#b77900" />
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-lg font-bold text-slate-950">Change password</Text>
                            <Text className="text-xs text-slate-500">At least 6 characters</Text>
                        </View>
                        <Pressable onPress={() => setShow((v) => !v)} className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                            {show ? <EyeOff size={16} color="#334155" /> : <Eye size={16} color="#334155" />}
                        </Pressable>
                        <Pressable onPress={close} className="h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                            <X size={16} color="#334155" />
                        </Pressable>
                    </View>

                    {field(current, setCurrent, 'Current password')}
                    {field(next, setNext, 'New password')}
                    {field(confirm, setConfirm, 'Confirm new password')}

                    {error ? <Text className="mt-2 text-sm text-red-600">{error}</Text> : null}

                    <Pressable onPress={submit} disabled={change.isPending} className="mt-5 active:opacity-80">
                        <GradientPill className="h-12 rounded-full">
                            <View className="flex-1 items-center justify-center">
                                {change.isPending ? (
                                    <ActivityIndicator color="#111827" />
                                ) : (
                                    <Text className="text-base font-bold text-slate-950">Update password</Text>
                                )}
                            </View>
                        </GradientPill>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
