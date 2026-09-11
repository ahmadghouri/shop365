import { Pressable, Text, View } from "react-native";
import { BellOff, ChevronLeft } from "lucide-react-native";
import { AppColors } from "@/components/reusable/colors";

export type NotificationHeaderProps = {
  unreadCount: number;
  onBack?: () => void;
  onMarkAllRead?: () => void;
};

export function NotificationHeader({
  unreadCount,
  onBack,
  onMarkAllRead,
}: NotificationHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
      <View className="flex-row items-center">
        {onBack && (
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-white/60 active:opacity-60 mr-2"
            onPress={onBack}
          >
            <ChevronLeft size={22} color={AppColors.dark} />
          </Pressable>
        )}
        <View>
          <Text className="text-2xl font-lufga-bold text-slate-900">
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Text className="text-xs font-lufga text-slate-500">
              {unreadCount} unread
            </Text>
          )}
        </View>
      </View>
      {unreadCount > 0 && (
        <Pressable
          className="flex-row items-center rounded-full bg-amber-50 px-3 py-2 active:opacity-70"
          onPress={onMarkAllRead}
        >
          <BellOff size={14} color={AppColors.yellow} />
          <Text className="ml-1.5 text-xs font-lufga-semibold text-amber-700">
            Mark all read
          </Text>
        </Pressable>
      )}
    </View>
  );
}
