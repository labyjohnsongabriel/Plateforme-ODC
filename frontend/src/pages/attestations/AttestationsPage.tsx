import { useAuth } from '@/context/AuthContext';
import { AttestationList } from '@/features/attestations';

export default function AttestationsPage() {
  const { user, isAdmin, isStaff } = useAuth();

  const mode = isAdmin || isStaff ? 'all' : 'mine';

  return (
    <div className="space-y-6 animate-fade-in">
      <AttestationList mode={mode} />
    </div>
  );
}