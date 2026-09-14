import { RefreshControl, ScrollView } from "react-native";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBackground } from "@/components/AppBackground";
import { AppColors } from "@/components/reusable/colors";
import { NotificationHeader } from "@/components/notifications/NotificationHeader";
import { NotificationList } from "@/components/notifications/NotificationList";
import {
  useNotificationStore,
  type Notification,
} from "@/lib/notificationStore";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  toLocalNotifications,
} from "@/api/notifications/notification.service";

type NotificationPageProps = {
  onBack?: () => void;
  onTrackOrder?: (orderId: string) => void;
};

export function NotificationPage({
  onBack,
  onTrackOrder,
}: NotificationPageProps) {
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    setNotifications,
    appendNotifications,
  } = useNotificationStore();
  const count = unreadCount();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const loadPage = async (page: number, replace: boolean) => {
    setLoading(true);
    try {
      const res = await fetchNotifications(page, 20);
      setHasMore(res.hasMore);
      const list = toLocalNotifications(res.data);
      if (replace) setNotifications(list);
      else appendNotifications(list);
      pageRef.current = page;
    } catch {
      // keep what we have
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = () => {
    if (loading || !hasMore) return;
    loadPage(pageRef.current + 1, false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetchNotifications(1, 20);
      setHasMore(res.hasMore);
      const list = toLocalNotifications(res.data);
      setNotifications(list);
      pageRef.current = 1;
    } finally {
      setRefreshing(false);
    }
  };

  const handleNotifPress = (notif: Notification) => {
    markRead(notif.id);
    markNotificationRead(notif.id).catch(() => {});
    if (
      notif.reference_type === "order" &&
      notif.reference_id &&
      onTrackOrder
    ) {
      onTrackOrder(notif.reference_id);
    }
  };

  const handleMarkAllRead = () => {
    markAllRead();
    markAllNotificationsRead().catch(() => {});
  };

  return (
    <AppBackground>
      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        <NotificationHeader
          unreadCount={count}
          onBack={onBack}
          onMarkAllRead={handleMarkAllRead}
        />

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={AppColors.yellow}
              colors={[AppColors.yellow]}
            />
          }
          onScroll={({ nativeEvent }) => {
            const { contentOffset, contentSize, layoutMeasurement } =
              nativeEvent;
            if (
              contentOffset.y + layoutMeasurement.height >=
              contentSize.height - 200
            )
              loadMore();
          }}
          scrollEventThrottle={200}
        >
          <NotificationList
            notifications={notifications}
            loading={loading}
            onItemPress={handleNotifPress}
          />
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}
