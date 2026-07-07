// Browser-Benachrichtigungen fuer faellige Eintraege.
// Funktioniert nur, solange die Seite offen bzw. kuerzlich offen war -
// kein echtes Hintergrund-Push wie bei einer nativen App (braucht einen
// Push-Server, den es hier nicht gibt).

const LAST_NOTIFIED_KEY = 'richardai-last-notified';

export function notificationsSupported(): boolean {
  return typeof Notification !== 'undefined';
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  return notificationsSupported() ? Notification.permission : 'unsupported';
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) {
    return 'denied';
  }
  return Notification.requestPermission();
}

export function showNotification(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') {
    return;
  }
  new Notification(title, { body, icon: '/favicon.ico' });
}

// Nur einmal pro Tag benachrichtigen, damit man beim Neuladen der Seite
// nicht staendig dieselbe Meldung bekommt.
export function alreadyNotifiedToday(todayStr: string): boolean {
  return localStorage.getItem(LAST_NOTIFIED_KEY) === todayStr;
}

export function markNotifiedToday(todayStr: string): void {
  localStorage.setItem(LAST_NOTIFIED_KEY, todayStr);
}
