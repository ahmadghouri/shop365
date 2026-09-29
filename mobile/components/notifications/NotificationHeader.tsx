import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { BellOff, ChevronLeft } from "lucide-react-native";
import { AppColors } from "@/components/reusable/colors";
import { GradientPill } from "@/components/reusable/GradientPill";

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
  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const isTiny = width < 340;

  return (
    <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
      <View className="flex-row items-center flex-1 mr-2">
        {onBack && (
          <Pressable
            className={`items-center justify-center rounded-full bg-white/60 active:opacity-60 mr-2 ${isSmall ? "h-9 w-9" : "h-10 w-10"
              }`}
            onPress={onBack}
          >
            <ChevronLeft size={isSmall ? 20 : 22} color={AppColors.dark} />
          </Pressable>
        )}
        <View className="flex-1">
          <Text
            className={`font-lufga-bold text-slate-900 ${isTiny ? "text-xl" : isSmall ? "text-[22px]" : "text-2xl"
              }`}
            numberOfLines={1}
          >
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Text className="text-xs font-lufga text-slate-500" numberOfLines={1}>
              {unreadCount} unread
            </Text>
          )}
        </View>
      </View>
      {unreadCount > 0 && (
        <GradientPill className="h-9 rounded-full shrink-0">
          <Pressable
            className={`h-full flex-row items-center justify-center active:opacity-70 ${isSmall ? "px-3" : "px-3.5"
              }`}
            onPress={onMarkAllRead}
          >
            <BellOff size={14} color={AppColors.dark} />
            {!isTiny && (
              <Text className="ml-1.5 text-xs font-lufga-semibold text-slate-900">
                Mark all read
              </Text>
            )}
          </Pressable>
        </GradientPill>
      )}
    </View>
  );
}
