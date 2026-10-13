/** Formatage des dates en français. */
export const formatDate = (
  date: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', options ?? {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDateShort = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Formatage monétaire. */
export const formatPrice = (price: number, currency = 'MGA'): string => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
};

/** Formatage de nombre. */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

/** Formate un taux en pourcentage. */
export const formatPercent = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)} %`;
};

/** Calcule la durée entre deux dates. */
export const formatDuration = (start: Date, end: Date): string => {
  const diff = end.getTime() - start.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  if (days > 0) return `${days}j ${hours}h`;
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
};

/** Formate une durée relative (ex: "il y a 5 minutes"). */
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7) return `il y a ${days}j`;
  return formatDateShort(d);
};