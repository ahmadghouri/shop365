import { ActivityIndicator, Pressable, Text, View } from "react-native";
import LottieView from "lottie-react-native";
import { MapPin } from "lucide-react-native";
import { useUpdateLocationMutation } from "@/api/users/useUpdateLocationMutation";
import { useAuthStore } from "@/lib/authStore";
import { useLocation } from "@/lib/useLocation";
import { GlassCard } from "../reusable/GlassCard";
import { useNotificationStore } from "@/lib/notificationStore";

type HomeHeaderProps = {
  onNotificationPress?: () => void;
};

export function HomeHeader({ onNotificationPress }: HomeHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const { location, loading, detectLocation } = useLocation();
  const updateLocation = useUpdateLocationMutation();
  const unreadCount = useNotificationStore((s) => s.unreadCount());

  const savedAddress =
    user?.address || user?.household_id?.address || user?.household?.address;
  const displayAddress =
    location?.address || savedAddress || "Tap to detect location";
  const isLocating = loading || updateLocation.isPending;

  const handleDetectLocation = async () => {
    const detected = await detectLocation();
    const userId = user?._id || user?.id;
    if (!detected || !userId) return;

    updateLocation.mutate({ userId, location: detected });
  };

  return (
    <View className="flex-row items-center justify-between px-5 pb-3 pt-4">
      <View className="flex-1 flex-row items-center gap-4">
        <GlassCard className="rounded-full">
          <Pressable
            className="h-12 w-12 items-center justify-center active:opacity-70"
            disabled={isLocating}
            onPress={handleDetectLocation}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#111827" />
            ) : (
              <MapPin size={20} color="#111827" />
            )}
          </Pressable>
        </GlassCard>

        <View className="flex-1">
          <Text className="text-[16px] font-normal font-lufga text-app-dark">
            Hey, {user?.name || "User"}
          </Text>
          <View className="flex-row items-center">
            {/* <LocateFixed size={13} color="#64748b" /> */}
            <Text
              className="flex-1 text-sm font-lufga font-light text-app-muted"
              numberOfLines={1}
            >
              {isLocating ? "Detecting location..." : displayAddress}
            </Text>
          </View>
        </View>
      </View>

      <GlassCard className="rounded-full">
        <Pressable
          className="h-12 w-12 items-center justify-center"
          onPress={onNotificationPress}
        >
          <LottieView
            key={unreadCount > 0 ? "ringing" : "idle"}
            source={require("@/assets/lottiefilesicons/bell.json")}
            autoPlay={unreadCount > 0}
            loop={unreadCount > 0}
            speed={1}
            style={{ width: 50, height: 50 }}
          />
          {unreadCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                height: 16,
                minWidth: 16,
                borderRadius: 8,
                backgroundColor: "#EAB308",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 3,
              }}
            >
              <Text
                style={{ color: "#111", fontSize: 9, fontFamily: "Lufga-Bold" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </GlassCard>
    </View>
  );
}
