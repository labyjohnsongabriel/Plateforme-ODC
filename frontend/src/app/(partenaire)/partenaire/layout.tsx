import { PartenaireSidebar } from '@/components/layout/partenaire/PartenaireSidebar';
import { PartenaireHeader } from '@/components/layout/partenaire/PartenaireHeader';
import { PartenaireBreadcrumb } from '@/components/layout/partenaire/PartenaireBreadcrumb';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function PartenaireLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['PARTENAIRE', 'ADMINISTRATEUR']}>
      <div className="flex h-screen bg-background overflow-hidden">
        <PartenaireSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <PartenaireHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px]">
              <PartenaireBreadcrumb />
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}