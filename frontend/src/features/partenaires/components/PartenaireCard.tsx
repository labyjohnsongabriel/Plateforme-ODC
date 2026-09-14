import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  User,
} from 'lucide-react';
import { Partenaire } from '../services/partenaire.service';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { IconButton } from '@/components/common/IconButton';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/common/Dropdown';

interface PartenaireCardProps {
  partenaire: Partenaire;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PartenaireCard({
  partenaire,
  onClick,
  onEdit,
  onDelete,
}: PartenaireCardProps) {
  return (
    <Card hover className="group relative">
      {/* Actions dropdown */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Dropdown
          trigger={
            <IconButton
              icon={<MoreVertical size={16} />}
              variant="ghost"
              size="sm"
            />
          }
        >
          <DropdownItem icon={<Edit size={14} />} onClick={onEdit}>
            Modifier
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={<Trash2 size={14} />} onClick={onDelete} danger>
            Supprimer
          </DropdownItem>
        </Dropdown>
      </div>

      {/* Header */}
      <div onClick={onClick} className="cursor-pointer">
        <div className="flex items-start gap-4 mb-4">
          {/* Logo */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white flex-shrink-0 overflow-hidden shadow-odc-md">
            {partenaire.logoUrl ? (
              <img
                src={partenaire.logoUrl}
                alt={partenaire.nom}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 size={26} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-odc-text-light dark:text-odc-text-dark truncate">
              {partenaire.nom}
            </h3>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {partenaire.secteur && (
                <Badge variant="primary" size="xs">
                  {partenaire.secteur}
                </Badge>
              )}
              <Badge variant={partenaire.actif ? 'success' : 'neutral'} size="xs">
                {partenaire.actif ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        {partenaire.description && (
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark line-clamp-2 mb-4">
            {partenaire.description}
          </p>
        )}

        {/* Contact */}
        <div className="space-y-2 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
          {partenaire.contactNom && (
            <div className="flex items-center gap-2">
              <User size={12} className="flex-shrink-0" />
              <span className="truncate">{partenaire.contactNom}</span>
            </div>
          )}
          {partenaire.contactEmail && (
            <div className="flex items-center gap-2">
              <Mail size={12} className="flex-shrink-0" />
              <span className="truncate">{partenaire.contactEmail}</span>
            </div>
          )}
          {partenaire.contactTel && (
            <div className="flex items-center gap-2">
              <Phone size={12} className="flex-shrink-0" />
              <span>{partenaire.contactTel}</span>
            </div>
          )}
          {partenaire.ville && (
            <div className="flex items-center gap-2">
              <MapPin size={12} className="flex-shrink-0" />
              <span className="truncate">
                {partenaire.ville}
                {partenaire.pays && `, ${partenaire.pays}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Site web */}
      {partenaire.siteWeb && (
        <div className="mt-4 pt-4 border-t border-odc-border-light dark:border-odc-border-dark">
          <a
            href={partenaire.siteWeb}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-xs text-odc-primary hover:underline font-medium"
          >
            <Globe size={12} />
            Visiter le site web
            <ExternalLink size={10} />
          </a>
        </div>
      )}
    </Card>
  );
}