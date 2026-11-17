import { AdminSidebar } from '@/components/layout/admin/AdminSidebar';
import { AdminHeader } from '@/components/layout/admin/AdminHeader';
import { AdminBreadcrumb } from '@/components/layout/admin/AdminBreadcrumb';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMINISTRATEUR']}>
      <div className="flex h-screen overflow-hidden bg-odc-background">
        {/* ─── Skip-link (accessibilité clavier) ───────────────────────── */}
        <a
          href="#admin-main-content"
          className="sr-only rounded-lg bg-odc-primary px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:shadow-odc-lg"
        >
          Aller au contenu principal
        </a>

        {/* ─── Sidebar (sticky desktop / drawer mobile) ────────────────── */}
        <AdminSidebar />

        {/* ─── Colonne contenu ─────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header sticky */}
          <AdminHeader />

          {/* Zone principale (seule zone scrollable) */}
          <main
            id="admin-main-content"
            role="main"
            aria-label="Contenu principal"
            className="flex-1 overflow-y-auto bg-odc-background"
          >
            <div className="container mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
              {/* Fil d'Ariane contextuel */}
              <nav aria-label="Fil d'Ariane" className="mb-6">
                <AdminBreadcrumb />
              </nav>

              {/* Contenu de la page */}
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}