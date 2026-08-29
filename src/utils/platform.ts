export function isNative(): boolean {
  return typeof (window as unknown as Record<string, unknown>).Capacitor !== 'undefined';
}

export function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function getPlatform(): 'web' | 'android' | 'ios' {
  const cap = (window as unknown as Record<string, unknown>).Capacitor as Record<string, unknown> | undefined;
  if (cap?.getPlatform) {
    const platform = (cap.getPlatform as () => string)();
    if (platform === 'android') return 'android';
    if (platform === 'ios') return 'ios';
  }
  return 'web';
}
