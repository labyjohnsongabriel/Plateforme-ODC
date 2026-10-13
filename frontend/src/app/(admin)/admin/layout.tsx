import { AdminSidebar } from '@/components/layout/admin/AdminSidebar';
import { AdminHeader } from '@/components/layout/admin/AdminHeader';
import { AdminBreadcrumb } from '@/components/layout/admin/AdminBreadcrumb';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMINISTRATEUR']}>
      <div className="flex h-screen bg-background overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px]">
              <AdminBreadcrumb />
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}