import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { FormationForm } from '@/features/formations';

export default function FormationEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
          Retour
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
            Modifier la formation
          </h1>
        </div>
      </div>

      <FormationForm formationId={id} />
    </div>
  );
}