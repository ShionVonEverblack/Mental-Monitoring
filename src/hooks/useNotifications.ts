import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const getLang = (): string => {
  try {
    return localStorage.getItem('i18nextLng') || 'id';
  } catch {
    return 'id';
  }
};

interface NotificationSettings {
  enabled: boolean;
  reminderTime: string; // HH:mm format, e.g. "20:00"
  quietHoursStart: string; // HH:mm format, default "22:00"
  quietHoursEnd: string;   // HH:mm format, default "07:00"
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  reminderTime: '20:00',
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};

/**
 * Check if current time is within quiet hours.
 * Calm Technology principle: suppress notifications during sleep hours.
 */
function isQuietHours(start: string, end: string): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

export function useNotifications() {
  const [settings, setSettings] = useLocalStorage<NotificationSettings>('rima-notification-settings', DEFAULT_SETTINGS);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  // In-app toast message state (replaces alert() — Calm Technology)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') {
      // Gentle toast instead of alert() — Calm Technology
      showToast(getLang() === 'en' ? 'Your device does not support web notifications.' : 'Perangkat Anda tidak mendukung notifikasi web.');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }));
        return true;
      } else {
        setSettings(prev => ({ ...prev, enabled: false }));
        return false;
      }
    } catch (e) {
      console.error('Failed to request notification permission:', e);
      return false;
    }
  }, [setSettings, showToast]);

  const toggleNotifications = useCallback(async () => {
    if (!settings.enabled) {
      if (permission !== 'granted') {
        await requestPermission();
      } else {
        setSettings(prev => ({ ...prev, enabled: true }));
      }
    } else {
      setSettings(prev => ({ ...prev, enabled: false }));
    }
  }, [settings.enabled, permission, requestPermission, setSettings]);

  const setReminderTime = useCallback((time: string) => {
    setSettings(prev => ({ ...prev, reminderTime: time }));
  }, [setSettings]);

  const setQuietHours = useCallback((start: string, end: string) => {
    setSettings(prev => ({ ...prev, quietHoursStart: start, quietHoursEnd: end }));
  }, [setSettings]);

  const sendTestNotification = useCallback(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      // Respect quiet hours even for test notifications
      if (isQuietHours(settings.quietHoursStart || '22:00', settings.quietHoursEnd || '07:00')) {
        showToast(getLang() === 'en' ? '🌙 Quiet hours active. Notifications are paused.' : '🌙 Jam tenang aktif. Notifikasi dijeda.');
        return;
      }
      new Notification(getLang() === 'en' ? 'RIMA — Mental Health Reminder' : 'RIMA — Pengingat Kesehatan Mental', {
        body: getLang() === 'en' ? 'Hello! How are you feeling today? Take 1 minute to log your mood.' : 'Halo! Bagaimana perasaanmu hari ini? Luangkan 1 menit untuk mencatat mood-mu.',
        icon: '/favicon.svg',
      });
    } else {
      // Gentle toast instead of alert() — Calm Technology
      showToast(getLang() === 'en' ? 'Notifications not allowed. Please enable notifications first.' : 'Notifikasi belum diizinkan. Izinkan notifikasi terlebih dahulu.');
    }
  }, [settings.quietHoursStart, settings.quietHoursEnd, showToast]);

  return {
    enabled: settings.enabled && permission === 'granted',
    reminderTime: settings.reminderTime,
    quietHoursStart: settings.quietHoursStart || '22:00',
    quietHoursEnd: settings.quietHoursEnd || '07:00',
    permission,
    toastMessage,
    requestPermission,
    toggleNotifications,
    setReminderTime,
    setQuietHours,
    sendTestNotification,
    showToast,
  };
}
