import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, BellOff, ChevronLeft, ShoppingBag, Star, Tag, Truck } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/reusable/GlassCard';
import { AppColors } from '@/components/reusable/colors';
import { useNotificationStore, type Notification } from '@/lib/notificationStore';

type NotifType = 'order' | 'promo' | 'delivery' | 'review' | 'general';

const TYPE_META: Record<NotifType, { Icon: any; bg: string; color: string }> = {
    order: { Icon: ShoppingBag, bg: '#FEF9C3', color: '#B45309' },
    delivery: { Icon: Truck, bg: '#DBEAFE', color: '#1D4ED8' },
    promo: { Icon: Tag, bg: '#DCFCE7', color: '#15803D' },
    review: { Icon: Star, bg: '#FEE2E2', color: '#B91C1C' },
    general: { Icon: Bell, bg: '#F1F5F9', color: '#475569' },
};

function NotifItem({ notif, onPress }: { notif: Notification; onPress: (id: string) => void }) {
    const { Icon, bg, color } = TYPE_META[notif.type];
    return (
        <Pressable onPress={() => onPress(notif.id)} className="active:opacity-80">
            <GlassCard variant="light" className={`rounded-2xl mb-3 ${notif.read ? 'opacity-70' : ''}`}>
                <View className="flex-row items-start px-4 py-4">
                    <View style={{ backgroundColor: bg }} className="h-11 w-11 items-center justify-center rounded-2xl mr-3 mt-0.5">
                        <Icon size={20} color={color} />
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-0.5">
                            <Text className="text-sm font-lufga-semibold text-slate-900 flex-1 mr-2" numberOfLines={1}>
                                {notif.title}
                            </Text>
                            <Text className="text-xs font-lufga text-slate-400">{notif.time}</Text>
                        </View>
                        <Text className="text-xs font-lufga text-slate-500 leading-5" numberOfLines={2}>
                            {notif.body}
                        </Text>
                    </View>
                    {!notif.read && (
                        <View style={{ backgroundColor: AppColors.yellow }} className="h-2 w-2 rounded-full ml-2 mt-2" />
                    )}
                </View>
            </GlassCard>
        </Pressable>
    );
}

type NotificationPageProps = { onBack?: () => void };

export function NotificationPage({ onBack }: NotificationPageProps) {
    const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();
    const count = unreadCount();
    const unread = notifications.filter((n) => !n.read);
    const read = notifications.filter((n) => n.read);

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
                    <View className="flex-row items-center">
                        {onBack && (
                            <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white/60 active:opacity-60 mr-2" onPress={onBack}>
                                <ChevronLeft size={22} color={AppColors.dark} />
                            </Pressable>
                        )}
                        <View>
                            <Text className="text-2xl font-lufga-bold text-slate-900">Notifications</Text>
                            {count > 0 && (
                                <Text className="text-xs font-lufga text-slate-500">{count} unread</Text>
                            )}
                        </View>
                    </View>
                    {count > 0 && (
                        <Pressable className="flex-row items-center rounded-full bg-amber-50 px-3 py-2 active:opacity-70" onPress={markAllRead}>
                            <BellOff size={14} color={AppColors.yellow} />
                            <Text className="ml-1.5 text-xs font-lufga-semibold text-amber-700">Mark all read</Text>
                        </Pressable>
                    )}
                </View>

                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    {unread.length > 0 && (
                        <>
                            <Text className="text-xs font-lufga-semibold uppercase tracking-widest text-slate-400 mb-3">New</Text>
                            {unread.map((n) => <NotifItem key={n.id} notif={n} onPress={markRead} />)}
                        </>
                    )}
                    {read.length > 0 && (
                        <>
                            <Text className="text-xs font-lufga-semibold uppercase tracking-widest text-slate-400 mb-3 mt-2">Earlier</Text>
                            {read.map((n) => <NotifItem key={n.id} notif={n} onPress={markRead} />)}
                        </>
                    )}
                    {notifications.length === 0 && (
                        <View className="items-center justify-center pt-32">
                            <View className="h-20 w-20 items-center justify-center rounded-full bg-amber-50 mb-4">
                                <Bell size={36} color={AppColors.yellow} />
                            </View>
                            <Text className="text-lg font-lufga-semibold text-slate-700">All caught up!</Text>
                            <Text className="mt-1 text-sm font-lufga text-slate-400 text-center">No notifications yet.</Text>
                        </View>
                    )}
                    <View className="h-28" />
                </ScrollView>
            </SafeAreaView>
        </AppBackground>
    );
}
