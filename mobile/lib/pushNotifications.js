import Constants from "expo-constants";
import { Platform } from "react-native";
import apiClient from "../api/client";

const isExpoGo = () =>
  Constants.executionEnvironment === "storeClient" ||
  Constants.appOwnership === "expo";

let notificationsPromise;
let notificationHandlerConfigured = false;

function loadNotifications() {
  notificationsPromise ??= import("expo-notifications");
  return notificationsPromise;
}

async function getNotifications() {
  const Notifications = await loadNotifications();
  if (!notificationHandlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationHandlerConfigured = true;
  }
  return Notifications;
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "web") return null;
  if (isExpoGo()) return null;

  const Notifications = await getNotifications();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#F59E0B",
    });
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) throw new Error("Expo EAS project ID is missing");

  const expoPushToken = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;
  if (__DEV__) console.log("Expo push token:", expoPushToken);
  return expoPushToken;
}

export async function registerPushToken(expoPushToken) {
  await apiClient.post("/push-token", {
    token: expoPushToken,
    platform: Platform.OS,
  });
}

export function setupPushNotificationListeners(onNotificationOpened) {
  if (Platform.OS === "web" || isExpoGo()) return () => {};

  let active = true;
  let receivedSubscription;
  let responseSubscription;

  getNotifications()
    .then((Notifications) => {
      if (!active) return;

      receivedSubscription = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log(
            "Push notification received",
            notification.request.content.data,
          );
        },
      );
      responseSubscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log(
            "Push notification opened",
            response.notification.request.content.data,
          );
          onNotificationOpened?.(response.notification.request.content.data);
        });

      Notifications.getLastNotificationResponseAsync()
        .then((response) => {
          if (active && response)
            onNotificationOpened?.(response.notification.request.content.data);
        })
        .catch(() => {});
    })
    .catch(() => {});

  return () => {
    active = false;
    receivedSubscription?.remove();
    responseSubscription?.remove();
  };
}
