import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ContactMap() {
  return (
    <Card>
      <CardContent className="p-0 overflow-hidden rounded-lg">
        <div className="relative aspect-[16/9] bg-odc-surface-alt">
          <iframe
            title="Localisation ODC Madagascar"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3898.0801104416377!2d47.5225!3d-18.8792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDUyJzQ1LjEiUyA0N8KwMzEnMjEuMCJF!5e0!3m2!1sfr!2smg!4v1700000000000"
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />

          <div className="absolute top-4 left-4 bg-odc-surface rounded-lg shadow-odc-md p-4 max-w-xs pointer-events-none">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-odc-primary flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-display font-semibold text-sm mb-0.5">
                  Orange Digital Center
                </p>
                <p className="text-xs text-odc-muted">Antananarivo, Madagascar</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}