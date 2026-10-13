import { StaffSidebar } from '@/components/layout/staff/StaffSidebar';
import { StaffHeader } from '@/components/layout/staff/StaffHeader';
import { StaffBreadcrumb } from '@/components/layout/staff/StaffBreadcrumb';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['STAFF_ODC', 'ADMINISTRATEUR']}>
      <div className="flex h-screen bg-background overflow-hidden">
        <StaffSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <StaffHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px]">
              <StaffBreadcrumb />
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}