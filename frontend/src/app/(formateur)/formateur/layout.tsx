import { FormateurSidebar } from '@/components/layout/formateur/FormateurSidebar';
import { FormateurHeader } from '@/components/layout/formateur/FormateurHeader';
import { FormateurBreadcrumb } from '@/components/layout/formateur/FormateurBreadcrumb';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function FormateurLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['FORMATEUR', 'STAFF_ODC', 'ADMINISTRATEUR']}>
      <div className="flex h-screen bg-background overflow-hidden">
        <FormateurSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <FormateurHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px]">
              <FormateurBreadcrumb />
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}