import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    CircleHelp,
    CreditCard,
    Heart,
    History,
    LogOut,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Shield,
    ShoppingBag,
    Star,
    User,
} from 'lucide-react-native';
import { useAuthStore } from '@/lib/authStore';
import { AppBackground } from '@/components/AppBackground';

type ProfilePageProps = {
    onLogout?: () => void;
    onBack?: () => void;
};

export function ProfilePage({ onLogout, onBack }: ProfilePageProps) {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    onLogout?.();
                },
            },
        ]);
    };

    const name = user?.name || 'User';
    const phone = user?.phone || user?.phone_number || '—';
    const email = user?.email || '—';
    const address = user?.address || user?.location?.address || 'Not set';
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

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Avatar & Info */}
                    <View className="items-center px-5 pb-6 pt-6">
                        <View className="h-28 w-28 items-center justify-center rounded-full bg-slate-900 shadow-lg shadow-slate-400">
                            <Text className="text-3xl font-lufga-bold text-amber-300">{initials}</Text>
                        </View>
                        <Text className="mt-4 text-2xl font-lufga-bold text-slate-950">{name}</Text>
                        <Text className="mt-1 text-sm font-lufga text-slate-500">
                            {email !== '—' ? email : phone}
                        </Text>
                        <Pressable className="mt-4 flex-row items-center rounded-full bg-slate-900 px-5 py-2.5 active:opacity-80">
                            <Pencil size={14} color="#FCD34D" />
                            <Text className="ml-2 text-sm font-lufga-semibold text-white">Edit Profile</Text>
                        </Pressable>
                    </View>

                    {/* Personal Info Card */}
                    <View className="mx-5 mt-2 rounded-[28px] bg-white p-1 shadow-sm shadow-slate-100">
                        <Text className="px-4 pb-2 pt-4 text-xs font-lufga-semibold uppercase tracking-widest text-slate-400">Personal Information</Text>

                        <ProfileRow icon={<Phone size={18} color="#b77900" />} label="Phone" value={phone} />
                        <ProfileRow icon={<Mail size={18} color="#b77900" />} label="Email" value={email} />
                        <ProfileRow icon={<MapPin size={18} color="#b77900" />} label="Address" value={address} last />
                    </View>

                    {/* Quick Actions */}
                    <View className="mx-5 mt-5 rounded-[28px] bg-white p-1 shadow-sm shadow-slate-100">
                        <Text className="px-4 pb-2 pt-4 text-xs font-lufga-semibold uppercase tracking-widest text-slate-400">Activity</Text>

                        <ActionRow icon={<ShoppingBag size={18} color="#334155" />} label="My Orders" />
                        <ActionRow icon={<Heart size={18} color="#ef4444" />} label="Wishlist" />
                        <ActionRow icon={<History size={18} color="#6366f1" />} label="Order History" />
                        <ActionRow icon={<CreditCard size={18} color="#0ea5e9" />} label="Payment Methods" />
                        <ActionRow icon={<Star size={18} color="#f59e0b" />} label="My Reviews" last />
                    </View>

                    {/* Settings */}
                    <View className="mx-5 mt-5 rounded-[28px] bg-white p-1 shadow-sm shadow-slate-100">
                        <Text className="px-4 pb-2 pt-4 text-xs font-lufga-semibold uppercase tracking-widest text-slate-400">Settings</Text>

                        <ActionRow icon={<Bell size={18} color="#8b5cf6" />} label="Notifications" />
                        <ActionRow icon={<Shield size={18} color="#10b981" />} label="Privacy & Security" />
                        <ActionRow icon={<CircleHelp size={18} color="#64748b" />} label="Help & Support" last />
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
                    <View className="items-center pb-10 pt-2">
                        <Text className="text-xs font-lufga text-slate-300">SHOP365 · v1.0.0</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </AppBackground>
    );
}

function ProfileRow({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
    return (
        <View className={`flex-row items-center px-4 py-4 ${last ? '' : 'border-b border-slate-100'}`}>
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-amber-50">
                {icon}
            </View>
            <View className="ml-3 flex-1">
                <Text className="text-xs font-lufga text-slate-400">{label}</Text>
                <Text className="mt-0.5 font-lufga-semibold text-slate-950" numberOfLines={2}>{value}</Text>
            </View>
        </View>
    );
}

function ActionRow({ icon, label, last }: { icon: React.ReactNode; label: string; last?: boolean }) {
    return (
        <Pressable className={`flex-row items-center px-4 py-4 active:bg-slate-50 ${last ? '' : 'border-b border-slate-100'}`}>
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                {icon}
            </View>
            <Text className="ml-3 flex-1 font-lufga-semibold text-slate-950">{label}</Text>
            <ChevronRight size={18} color="#cbd5e1" />
        </Pressable>
    );
}