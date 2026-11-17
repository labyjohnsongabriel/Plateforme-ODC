export function getMediaUrl(value?: string | null): string | undefined {
  const source = value?.trim();
  if (!source) return undefined;
  if (/^(https?:|data:|blob:|\/\/)/i.test(source)) return source;

  const path = source.startsWith('/') ? source : `/${source}`;
  if (!path.startsWith('/uploads/')) return path;

  const apiUrl =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      : 'http://localhost:5000';
  const apiOrigin = apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  return `${apiOrigin}${path}`;
}
