import { useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import api from '@/services/api';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { MemberProfile } from '@/features/reseautage';
import { User } from 'lucide-react';

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: member, loading } = useFetch(
    () => (id ? api.get(`/users/${id}`).then((r) => r.data.data) : Promise.resolve(null)),
    [id]
  );

  if (loading) return <Loader fullScreen />;
  if (!member) {
    return <EmptyState icon={<User size={48} />} title="Membre introuvable" />;
  }

  return (
    <MemberProfile
      member={member}
      onConnect={() => {}}
      onMessage={() => {}}
    />
  );
}