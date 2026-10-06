import { format, formatDistanceToNow, differenceInDays, addDays, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';

export { format, formatDistanceToNow, differenceInDays, addDays, isAfter, isBefore };

/** Formate une date ISO en format français. */
export const dateFR = (date: string | Date, pattern = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern, { locale: fr });
};

/** Formate une date en format long (ex: "12 janvier 2025"). */
export const dateLongFR = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMMM yyyy', { locale: fr });
};

/** Retourne la durée relative (ex: "il y a 5 minutes"). */
export const timeAgo = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
};

/** Vérifie si une date est dans le futur. */
export const isFuture = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return isAfter(d, new Date());
};

/** Vérifie si une date est dans le passé. */
export const isPast = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return isBefore(d, new Date());
};

/** Convertit en input HTML `<input type="date">`. */
export const toInputDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
};