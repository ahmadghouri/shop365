import { Pressable, Text, View } from "react-native";
import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
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

function LottieIcon({
  source,
  size = 44,
  loop = true,
}: {
  source: any;
  size?: number;
  loop?: boolean;
}) {
  const ref = useRef<any>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        ref.current?.reset();
        ref.current?.play();
      } catch {}
    }, 16);
    return () => clearTimeout(t);
  }, [source]);
  return (
    <LottieView
      ref={ref}
      source={source}
      autoPlay={false}
      loop={loop}
      speed={1}
      renderMode="SOFTWARE"
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}

export function NotificationItem({ notif, onPress }: NotificationItemProps) {
  const { Icon, bg, color } = TYPE_META[notif.type];
  const text = `${notif.title ?? ""} ${notif.body ?? ""}`.toLowerCase();
  const bizType = notif.metadata?.business_type?.toLowerCase();
  const businessName = (notif.metadata?.business_name ?? "").toLowerCase();
  const isFood =
    bizType === "food" ||
    bizType === "restaurant" ||
    /food|restaurant|biryani|pizza|burger|cooking|kitchen|cuisine|tikka|karahi|naan|menu|meal|dinner|lunch|breakfast/.test(
      text + businessName,
    );
  const isGrocery =
    bizType === "grocery" ||
    /grocery|kiryana|supermarket|mart|daily|items|atta|rice|sugar|oil|dal|soap|vegetable|fruit|grocery/.test(
      text + businessName,
    );

  const isRiderPickedUp =
    notif.type === "delivery" &&
    /picked.*rider|rider.*picked/i.test(notif.title);
  const isOrderPlaced = /order.*placed|placed.*order/i.test(notif.title);
  const isOrderConfirmed =
    /confirm/i.test(notif.title) && /order/i.test(notif.title);
  const isOrderDelivered =
    /deliver/i.test(notif.title) && /order/i.test(notif.title);
  const isOutForDelivery = /out.*for.*delivery|on.*its.*way/i.test(notif.title);
  const isPreparing = /prepar/.test(notif.title) || /prepar/.test(text);

  let lottieSource: any = null;
  let lottieSize = 44;
  if (isRiderPickedUp) {
    lottieSource = require("@/assets/lottiefilesicons/pick-rider.json");
    lottieSize = 50;
  } else if (isOrderPlaced) {
    lottieSource = require("@/assets/lottiefilesicons/order-placed.json");
    lottieSize = 52;
  } else if (isOrderConfirmed) {
    lottieSource = require("@/assets/lottiefilesicons/confirmed.json");
    lottieSize = 50;
  } else if (isOrderDelivered) {
    lottieSource = require("@/assets/lottiefilesicons/delivered.json");
    lottieSize = 50;
  } else if (isOutForDelivery) {
    lottieSource = require("@/assets/lottiefilesicons/out-of-delivery.json");
    lottieSize = 52;
  } else if (isPreparing) {
    if (isGrocery && !isFood) {
      lottieSource = require("@/assets/lottiefilesicons/Grocery.json");
    } else {
      lottieSource = require("@/assets/lottiefilesicons/Cooking.json");
    }
    lottieSize = 50;
  }

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
          {lottieSource ? (
            <View
              style={{
                width: 48,
                height: 48,
                marginRight: 12,
                marginTop: 2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LottieIcon source={lottieSource} size={lottieSize} />
            </View>
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
