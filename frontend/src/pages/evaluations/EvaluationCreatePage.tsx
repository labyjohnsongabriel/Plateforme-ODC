import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { EvaluationForm } from '@/features/evaluations';
import { FileText } from 'lucide-react';

export default function EvaluationCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');

  if (!sessionId) {
    return (
      <EmptyState
        icon={<FileText size={48} />}
        title="Session requise"
        description="Veuillez sélectionner une session"
        action={<Button onClick={() => navigate('/evaluations')}>Retour</Button>}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
        Retour
      </Button>

      <Card>
        <EvaluationForm
          sessionId={sessionId}
          onSuccess={() => navigate('/evaluations')}
          onCancel={() => navigate(-1)}
        />
      </Card>
    </div>
  );
}