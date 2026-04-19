const OSS_PROCESS = 'image/resize,m_fill,w_60,h_60';

export function normalizeAvatarUrl(url: unknown): string {
  if (typeof url !== 'string' || !url) return (url as string) || '';
  try {
    const u = new URL(url);
    if (u.hostname !== 'media.cointech2u.com') return url;
    const base = `${u.origin}${u.pathname}`;
    // OSS image processing doesn't support SVG — strip query only.
    if (u.pathname.toLowerCase().endsWith('.svg')) return base;
    return `${base}?x-oss-process=${OSS_PROCESS}`;
  } catch {
    return url;
  }
}
