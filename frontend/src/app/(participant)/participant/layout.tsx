import { ParticipantSidebar } from '@/components/layout/participant/ParticipantSidebar';
import { ParticipantHeader } from '@/components/layout/participant/ParticipantHeader';
import { ParticipantBreadcrumb } from '@/components/layout/participant/ParticipantBreadcrumb';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['PARTICIPANT']}>
      <div className="flex h-screen bg-background overflow-hidden">
        <ParticipantSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ParticipantHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px]">
              <ParticipantBreadcrumb />
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}