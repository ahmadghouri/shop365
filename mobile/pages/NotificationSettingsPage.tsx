import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Volume2, MessageSquare } from 'lucide-react-native';
import { AppBackground } from '@/components/AppBackground';
import { PageHeader } from '@/components/reusable/PageHeader';
import { AppColors } from '@/components/reusable/colors';
import { SettingsToggleRow } from '@/components/notifications/SettingsToggleRow';
import { useNotificationSettingsStore } from '@/lib/notificationSettingsStore';

type NotificationSettingsPageProps = {
    onBack?: () => void;
};

export function NotificationSettingsPage({ onBack }: NotificationSettingsPageProps) {
    const {
        pushEnabled,
        soundEnabled,
        alertsEnabled,
        setPushEnabled,
        setSoundEnabled,
        setAlertsEnabled,
    } = useNotificationSettingsStore();

    return (
        <AppBackground>
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <PageHeader
                    title="Notifications"
                    subtitle="Manage how you get notified"
                    onBack={onBack}
                    backIconColor="#1e293b"
                />

                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    <Text className="text-xs font-lufga-semibold uppercase tracking-widest text-slate-400 mt-2 mb-3">
                        Push Notifications
                    </Text>

                    <SettingsToggleRow
                        icon={<Bell size={18} color="#b77900" />}
                        title="Allow Notifications"
                        subtitle="Receive order updates, offers and alerts"
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                    />

                    <SettingsToggleRow
                        icon={<Volume2 size={18} color="#b77900" />}
                        title="Sound"
                        subtitle="Play a sound when a notification arrives"
                        value={soundEnabled}
                        disabled={!pushEnabled}
                        onValueChange={setSoundEnabled}
                    />

                    <SettingsToggleRow
                        icon={<MessageSquare size={18} color="#b77900" />}
                        title="In-app Banners"
                        subtitle="Show a banner alert while using the app"
                        value={alertsEnabled}
                        disabled={!pushEnabled}
                        onValueChange={setAlertsEnabled}
                    />

                    <View className="mt-2 rounded-2xl bg-amber-50/60 px-4 py-3">
                        <Text className="text-xs font-lufga text-amber-800 leading-5">
                            Tip: turning off "Allow Notifications" silences everything.
                            Your device may also have separate notification settings for this app.
                        </Text>
                    </View>

                    <View className="h-8" />
                </ScrollView>
            </SafeAreaView>
        </AppBackground>
    );
}
