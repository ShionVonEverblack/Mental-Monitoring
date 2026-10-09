---
name: rima-pwa-push-notifications
description: >-
  Implementation guide for privacy-first PWA Web Push notifications, VAPID infrastructure,
  Service Worker push events, and offline-scheduled gentle reminders in RIMA. Use when configuring
  push subscriptions, Notification Triggers API, quiet-hour enforcement, or iOS 16.4+ standalone PWA push.
---

# RIMA Privacy-Preserving PWA Web Push & Notification Architecture

## 1. Technical Context & iOS/Android Support

Web Push notifications drastically improve 14-day retention in digital therapeutics (*Baumel et al., 2019*). Modern browsers support Web Push as follows:
- **Chromium / Android**: Supported out-of-the-box via `PushManager` and VAPID.
- **Safari / iOS (16.4+)**: Supported **ONLY** when the PWA is added to the Home Screen by the user (`display: standalone`) and initiated via an explicit user gesture.
- **Notification Triggers API / Local Scheduling**: Experimental Chromium feature allowing local scheduling without server pings.

---

## 2. Anonymous VAPID Architecture (No PII Required)

```
┌─────────────────┐       1. Request Permission       ┌──────────────────────┐
│   User Device   ├──────────────────────────────────►│ Browser Notification │
│   (React PWA)   │◄──────────────────────────────────┤      System          │
└────────┬────────┘       2. Permission Granted       └──────────────────────┘
         │
         │ 3. pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })
         ▼
┌─────────────────┐       4. PushSubscription         ┌──────────────────────┐
│  Browser Push   ├──────────────────────────────────►│   RIMA Local Store   │
│ Service (FCM)   │   (endpoint + p256dh + auth)      │ (Or Anonymous Table) │
└─────────────────┘                                   └──────────────────────┘
```

### Absolute Zero-PII Rule
When storing a `PushSubscription` in a database:
- **NEVER** link the subscription to an email, username, phone number, or IP address.
- Store only the opaque `endpoint`, `keys.p256dh`, and `keys.auth`.
- If the user clicks "Hapus Seluruh Data" in Profile, revoke the push subscription via `subscription.unsubscribe()`.

---

## 3. Client Subscription Utility (`pushService.ts`)

```typescript
/**
 * Converts a base64 VAPID public key string to a Uint8Array buffer
 * for pushManager.subscribe.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers Web Push subscription anonymously.
 */
export async function registerPushNotification(
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Web Push is not supported in this environment');
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return null;
  }

  const reg = await navigator.serviceWorker.ready;
  const existingSub = await reg.pushManager.getSubscription();
  if (existingSub) {
    return existingSub;
  }

  return await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
}
```

---

## 4. Service Worker Push Event Handler (`sw.ts`)

```typescript
// Inside Service Worker scope
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const payload = event.data.json();
  const currentHour = new Date().getHours();

  // Guardrail: Quiet Hours (22:00 - 07:00)
  // Suppress sound & vibration during sleep window
  const isQuietHours = currentHour >= 22 || currentHour < 7;

  const options: NotificationOptions = {
    body: payload.body || 'Waktunya mengambil jeda tenang sejenak 🌿',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: 'rima-gentle-reminder',
    renotify: false,
    silent: isQuietHours,
    data: {
      url: payload.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'RIMA', options)
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
```

---

## 5. Offline Fallback: Notification Triggers API

For users without network connectivity or backend push services, verify if Chromium's `showNotification` trigger is supported:

```typescript
export async function scheduleOfflineNotification(
  title: string,
  body: string,
  triggerTimestamp: number
): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  const reg = await navigator.serviceWorker.ready;

  // Check if TimestampTrigger is supported
  if ('showNotification' in reg && 'TimestampTrigger' in window) {
    const TimestampTriggerClass = (window as unknown as { TimestampTrigger: new (t: number) => unknown }).TimestampTrigger;
    await reg.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      tag: 'rima-offline-scheduled',
      // @ts-expect-error Experimental Notification Triggers API
      showTrigger: new TimestampTriggerClass(triggerTimestamp),
    });
    return true;
  }

  return false;
}
```

---

## 6. Calm Tech Notification Copy Standards

- **Forbidden Words**: *"Peringatan!"*, *"PENTING"*, *"Cepat buka"*, *"Jangan lewatkan"*.
- **Approved Words**: *"Saatnya jeda sejenak"*, *"Napas perlahan bersama RIMA"*, *"Ruang tenang menantimu"*.
- **Frequency Capping**: Maximum **1 notification per 24 hours**. Never spam.
