import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { UserForm } from '@/features/users';

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
        Retour
      </Button>

      <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
        Modifier l'utilisateur
      </h1>

      <UserForm userId={id} />
    </div>
  );
}