import { ActivityIndicator, Text, View, useWindowDimensions } from "react-native";
import { Bell } from "lucide-react-native";
import { AppColors } from "@/components/reusable/colors";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import type { Notification } from "@/lib/notificationStore";

export type NotificationListProps = {
  notifications: Notification[];
  loading: boolean;
  onItemPress: (notif: Notification) => void;
};

export function NotificationList({
  notifications,
  loading,
  onItemPress,
}: NotificationListProps) {
  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  if (notifications.length === 0 && !loading) {
    return (
      <View className="items-center justify-center px-6 pt-32">
        <View
          className={`items-center justify-center rounded-full bg-amber-50 mb-4 ${isSmall ? "h-16 w-16" : "h-20 w-20"
            }`}
        >
          <Bell size={isSmall ? 30 : 36} color={AppColors.yellow} />
        </View>
        <Text
          className={`font-lufga-semibold text-slate-700 ${isSmall ? "text-base" : "text-lg"
            }`}
        >
          All caught up!
        </Text>
        <Text className="mt-1 text-sm font-lufga text-slate-400 text-center">
          No notifications yet.
        </Text>
      </View>
    );
  }

  return (
    <>
      {unread.length > 0 && (
        <>
          <Text className="text-xs font-lufga-semibold uppercase tracking-widest text-slate-400 mb-3">
            New
          </Text>
          {unread.map((n) => (
            <NotificationItem key={n.id} notif={n} onPress={onItemPress} />
          ))}
        </>
      )}
      {read.length > 0 && (
        <>
          <Text className="text-xs font-lufga-semibold uppercase tracking-widest text-slate-400 mb-3 mt-2">
            Earlier
          </Text>
          {read.map((n) => (
            <NotificationItem key={n.id} notif={n} onPress={onItemPress} />
          ))}
        </>
      )}
      {loading && (
        <View className="items-center py-4">
          <ActivityIndicator color={AppColors.yellow} />
        </View>
      )}
      <View className="h-28" />
    </>
  );
}
