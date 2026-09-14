import { useNavigate } from 'react-router-dom';
import { MemberDirectory } from '@/features/reseautage';

export default function ReseautagePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <MemberDirectory
        onViewProfile={(userId) => navigate(`/reseautage/members/${userId}`)}
      />
    </div>
  );
}