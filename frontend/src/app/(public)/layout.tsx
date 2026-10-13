import { PublicNavbar } from '@/components/layout/public/PublicNavbar';
import { PublicFooter } from '@/components/layout/public/PublicFooter';
import { ScrollToTop } from '@/components/shared/ScrollToTop';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <ScrollToTop />
    </div>
  );
}