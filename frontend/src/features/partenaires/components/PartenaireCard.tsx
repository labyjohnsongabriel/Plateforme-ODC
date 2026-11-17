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
import { getMediaUrl } from '@/lib/media';

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
      <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <Dropdown
          trigger={
            <IconButton icon={<MoreVertical size={16} />} variant="ghost" size="sm" />
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
        <div className="mb-4 flex items-start gap-4">
          {/* Logo */}
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-odc-primary to-odc-primary-dark text-white shadow-odc-md">
            {partenaire.logoUrl ? (
              <img
                src={getMediaUrl(partenaire.logoUrl)}
                alt={partenaire.nom}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 size={26} />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading font-semibold text-odc-text-light dark:text-odc-text-dark">
              {partenaire.nom}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-2">
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
          <p className="mb-4 line-clamp-2 text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
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
        <div className="mt-4 border-t border-odc-border-light pt-4 dark:border-odc-border-dark">
          <a
            href={partenaire.siteWeb}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-xs font-medium text-odc-primary hover:underline"
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
