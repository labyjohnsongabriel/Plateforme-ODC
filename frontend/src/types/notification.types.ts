export type TypeNotification = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface Notification {
  id: string;
  titre: string;
  message: string;
  type: TypeNotification;
  lue: boolean;
  lien?: string;
  icone?: string;
  metadata?: any;
  dateLecture?: string;
  expireAt?: string;
  userId: string;
  createdAt: string;
}