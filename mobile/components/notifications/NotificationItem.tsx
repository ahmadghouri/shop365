import { Pressable, Text, View } from "react-native";
import LottieView from "lottie-react-native";
import { Bell, ShoppingBag, Star, Tag, Truck } from "lucide-react-native";
import { GlassCard } from "@/components/reusable/GlassCard";
import { AppColors } from "@/components/reusable/colors";
import type { Notification } from "@/lib/notificationStore";

type NotifType = "order" | "promo" | "delivery" | "review" | "general";

const TYPE_META: Record<NotifType, { Icon: any; bg: string; color: string }> = {
  order: { Icon: ShoppingBag, bg: "#FEF9C3", color: "#B45309" },
  delivery: { Icon: Truck, bg: "#DBEAFE", color: "#1D4ED8" },
  promo: { Icon: Tag, bg: "#DCFCE7", color: "#15803D" },
  review: { Icon: Star, bg: "#FEE2E2", color: "#B91C1C" },
  general: { Icon: Bell, bg: "#F1F5F9", color: "#475569" },
};

export type NotificationItemProps = {
  notif: Notification;
  onPress: (notif: Notification) => void;
};

const SLOT_STYLE = {
  width: 48,
  height: 48,
  marginRight: 12,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  marginTop: 2,
};

function IconSlot({ children }: { children: React.ReactNode }) {
  return <View style={SLOT_STYLE}>{children}</View>;
}

export function NotificationItem({ notif, onPress }: NotificationItemProps) {
  const { Icon, bg, color } = TYPE_META[notif.type];
  const isRiderPickedUp =
    notif.type === "delivery" &&
    /picked.*rider|rider.*picked/i.test(notif.title);
  const isOrderPlaced = /order.*placed|placed.*order/i.test(notif.title);
  const isOrderConfirmed =
    /confirm/i.test(notif.title) && /order/i.test(notif.title);
  const isOrderDelivered =
    /deliver/i.test(notif.title) && /order/i.test(notif.title);
  const isOutForDelivery = /out.*for.*delivery|on.*its.*way/i.test(notif.title);
  const isPreparing = /prepar/i.test(notif.title) && /order/i.test(notif.title);
  const bizType = notif.metadata?.business_type?.toLowerCase();
  const isFood = bizType === "food" || bizType === "restaurant";
  const isGrocery = bizType === "grocery";

  return (
    <Pressable
      onPress={() => onPress(notif)}
      className="active:opacity-80 max-w-full"
    >
      <GlassCard
        variant="light"
        className={`rounded-2xl mb-3 w-full ${notif.read ? "opacity-70" : ""}`}
      >
        <View className="flex-row items-start px-4 py-4">
          {isRiderPickedUp ? (
            <IconSlot>
              <LottieView
                source={require("@/assets/lottiefilesicons/pick-rider.json")}
                autoPlay
                loop
                speed={1}
                resizeMode="cover"
                style={{ width: 58, height: 58 }}
              />
            </IconSlot>
          ) : isOrderPlaced ? (
            <IconSlot>
              <LottieView
                source={require("@/assets/lottiefilesicons/order-placed.json")}
                autoPlay
                loop={false}
                speed={1}
                resizeMode="cover"
                style={{ width: 64, height: 72 }}
              />
            </IconSlot>
          ) : isOrderConfirmed ? (
            <IconSlot>
              <LottieView
                source={require("@/assets/lottiefilesicons/confirmed.json")}
                autoPlay
                loop
                speed={1}
                resizeMode="cover"
                style={{ width: 60, height: 60 }}
              />
            </IconSlot>
          ) : isOrderDelivered ? (
            <IconSlot>
              <LottieView
                source={require("@/assets/lottiefilesicons/delivered.json")}
                autoPlay
                loop
                speed={1}
                resizeMode="cover"
                style={{ width: 58, height: 58 }}
              />
            </IconSlot>
          ) : isOutForDelivery ? (
            <IconSlot>
              <LottieView
                source={require("@/assets/lottiefilesicons/out-of-delivery.json")}
                autoPlay
                loop
                speed={1}
                resizeMode="cover"
                style={{ width: 64, height: 56 }}
              />
            </IconSlot>
          ) : isPreparing && isFood ? (
            <IconSlot>
              <LottieView
                source={require("@/assets/lottiefilesicons/Cooking.json")}
                autoPlay
                loop
                speed={1}
                resizeMode="cover"
                style={{ width: 60, height: 60 }}
              />
            </IconSlot>
          ) : isPreparing && isGrocery ? (
            <IconSlot>
              <LottieView
                source={require("@/assets/lottiefilesicons/Grocery.json")}
                autoPlay
                loop
                speed={1}
                resizeMode="cover"
                style={{ width: 60, height: 60 }}
              />
            </IconSlot>
          ) : (
            <View
              style={{ backgroundColor: bg }}
              className="h-11 w-11 items-center justify-center rounded-2xl mr-3 mt-0.5"
            >
              <Icon size={20} color={color} />
            </View>
          )}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-0.5">
              <Text
                className="text-sm font-lufga-semibold text-slate-900 flex-1 mr-2"
                numberOfLines={1}
              >
                {notif.title}
              </Text>
              <Text
                className="text-xs shrink-0 font-lufga text-slate-400"
                numberOfLines={1}
              >
                {notif.time}
              </Text>
            </View>
            <Text
              className="text-xs font-lufga text-slate-500 leading-5"
              numberOfLines={2}
            >
              {notif.body}
            </Text>
          </View>
          {!notif.read && (
            <View
              style={{ backgroundColor: AppColors.yellow }}
              className="h-2 w-2 rounded-full ml-2 mt-2"
            />
          )}
        </View>
      </GlassCard>
    </Pressable>
  );
}
