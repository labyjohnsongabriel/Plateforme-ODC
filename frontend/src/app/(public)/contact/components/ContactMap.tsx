import { MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/* ═══════════════════════════════════════════════════════════════════════════
   LOCALISATION — Fianarantsoa, Madagascar
   Coordonnées approximatives du centre-ville : -21.4411, 47.0858
   ═══════════════════════════════════════════════════════════════════════════ */

const ODC_LAT = -21.4411;
const ODC_LNG = 47.0858;

// URL d'embed — format "q=" plus fiable et maintenable que le format "pb="
const MAP_EMBED_URL =
  `https://maps.google.com/maps?q=${ODC_LAT},${ODC_LNG}` +
  `&hl=fr&z=14&output=embed`;

// URL pour ouvrir dans Google Maps (nouvel onglet)
const MAP_LINK_URL =
  `https://www.google.com/maps/search/?api=1&query=${ODC_LAT},${ODC_LNG}`;

export function ContactMap() {
  return (
    <Card>
      <CardContent className="p-0 overflow-hidden rounded-lg">
        <div className="relative aspect-[16/9] bg-odc-surface-alt">
          <iframe
            title="Localisation Orange Digital Center — Fianarantsoa"
            src={MAP_EMBED_URL}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />

          <div className="absolute top-4 left-4 bg-odc-surface rounded-lg shadow-odc-md p-4 max-w-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-odc-primary flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm mb-0.5">
                  Orange Digital Center
                </p>
                <p className="text-xs text-odc-muted mb-2">
                  Fianarantsoa, Madagascar
                </p>
                <a
                  href={MAP_LINK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-odc-primary font-medium inline-flex items-center gap-1 hover:underline"
                >
                  Ouvrir dans Google Maps
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}