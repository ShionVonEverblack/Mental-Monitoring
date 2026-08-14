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
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  reminderTime: '20:00',
};

export function useNotifications() {
  const [settings, setSettings] = useLocalStorage<NotificationSettings>('rima-notification-settings', DEFAULT_SETTINGS);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') {
      alert(getLang() === 'en' ? 'Your device does not support web notifications.' : 'Perangkat Anda tidak mendukung notifikasi web.');
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
  }, [setSettings]);

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

  const sendTestNotification = useCallback(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(getLang() === 'en' ? 'RIMA — Mental Health Reminder' : 'RIMA — Pengingat Kesehatan Mental', {
        body: getLang() === 'en' ? 'Hello! How are you feeling today? Take 1 minute to log your mood.' : 'Halo! Bagaimana perasaanmu hari ini? Luangkan 1 menit untuk mencatat mood-mu.',
        icon: '/favicon.svg',
      });
    } else {
      alert(getLang() === 'en' ? 'Notifications not allowed. Please enable notifications first.' : 'Notifikasi belum diizinkan. Izinkan notifikasi terlebih dahulu.');
    }
  }, []);

  return {
    enabled: settings.enabled && permission === 'granted',
    reminderTime: settings.reminderTime,
    permission,
    requestPermission,
    toggleNotifications,
    setReminderTime,
    sendTestNotification,
  };
}
