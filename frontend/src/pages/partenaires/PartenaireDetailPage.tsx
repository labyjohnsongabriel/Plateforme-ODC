import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, Globe, MapPin, User } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { PartenaireService } from '@/features/partenaires';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Loader } from '@/components/common/Loader';

export default function PartenaireDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: partenaire, loading } = useFetch(
    () => (id ? PartenaireService.getById(id) : Promise.resolve(null)),
    [id]
  );

  if (loading) return <Loader fullScreen />;
  if (!partenaire) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
        Retour
      </Button>

      <Card>
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white flex-shrink-0 overflow-hidden">
            {partenaire.logoUrl ? (
              <img src={partenaire.logoUrl} alt={partenaire.nom} className="w-full h-full object-cover" />
            ) : (
              <Building2 size={36} />
            )}
          </div>
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-2">
              {partenaire.nom}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              {partenaire.secteur && <Badge variant="primary">{partenaire.secteur}</Badge>}
              <Badge variant={partenaire.actif ? 'success' : 'neutral'}>
                {partenaire.actif ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </div>
        </div>

        {partenaire.description && (
          <p className="mt-6 text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark leading-relaxed">
            {partenaire.description}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-odc-border-light dark:border-odc-border-dark">
          {[
            { icon: User, label: 'Contact', value: partenaire.contactNom },
            { icon: Mail, label: 'Email', value: partenaire.contactEmail },
            { icon: Phone, label: 'Téléphone', value: partenaire.contactTel },
            { icon: MapPin, label: 'Adresse', value: `${partenaire.ville || ''} ${partenaire.pays || ''}`.trim() },
          ].map((item) => item.value && (
            <div key={item.label} className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-odc-primary-soft dark:bg-odc-primary-soft/20 text-odc-primary-dark">
                <item.icon size={16} />
              </div>
              <div>
                <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark uppercase">
                  {item.label}
                </div>
                <div className="text-sm font-medium text-odc-text-light dark:text-odc-text-dark">
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {partenaire.siteWeb && (
          <a
            href={partenaire.siteWeb}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center gap-2 text-odc-primary hover:underline text-sm font-medium"
          >
            <Globe size={14} />
            Visiter le site web
          </a>
        )}
      </Card>
    </div>
  );
}