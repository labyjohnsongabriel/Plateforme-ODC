import type { Metadata } from 'next';
import { NotificationsList } from './components/NotificationsList';

export const metadata: Metadata = { title: 'Notifications' };

export default function NotificationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Notifications
        </h1>
        <p className="text-odc-muted mt-1">
          Toutes vos notifications sur la plateforme ODC
        </p>
      </header>
      <NotificationsList />
    </div>
  );
}