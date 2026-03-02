import { NotificationsService } from "src/controller/NotificationsAPI.service";

/* eslint-disable no-restricted-syntax */
const publicVapidKey = "BGn8ofoakH97-BzKTf0LQmZkm2y2n21XvT3RFCNHrpf7Z1k6Y7s2xr-wTWY4P0XJQvovLdwI_l-mhOzTlP-7Q_s";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const saveSubscription = async (subscription: any) => {
  const res = await NotificationsService.subscribeNotifications(subscription);
  return res.status === 200 ? res.json() : false;
};

const generateSubscription = async (swRegistration: any) => {
  // Request notification permission
  const permission = await window.Notification.requestPermission();

  // Check if permission was granted
  if (permission !== 'granted') {
    console.warn('Push notification permission not granted:', permission);
    return null;
  }

  try {
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
    const saved = await saveSubscription(subscription);
    if (saved) return saved;
  } catch (error: any) {
    // Handle permission denied or other subscription errors
    if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
      console.warn('Push subscription not allowed or not supported:', error.message);
      return null;
    }
    throw error; // Re-throw unexpected errors
  }

  return null;
};

const registerServiceWorker = async () => {
  return await navigator.serviceWorker.register("/sw.js");
};

export const register = async () => {
  if (!("serviceWorker" in navigator)) {
    console.warn("ServiceWorkers are not supported by your browser!");
    return;
  }

  if (!("Notification" in window)) {
    console.warn("Notifications are not supported by your browser!");
    return;
  }

  try {
    const swRegistration = await registerServiceWorker();
    const sub = await generateSubscription(swRegistration);
    if (!sub) {
      console.warn("Push notification subscription failed or was denied");
    }
  } catch (error: any) {
    // Log error but don't throw - push notifications are optional
    console.warn("Failed to register push notifications:", error.message);
  }
};
