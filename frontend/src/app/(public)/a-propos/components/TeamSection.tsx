import Image from 'next/image';
import { Linkedin, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo?: string;
  linkedin?: string;
  email?: string;
}

const TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Direction Générale',
    role: 'Direction ODC',
    linkedin: '#',
    email: 'direction@odc.mg',
  },
  {
    id: '2',
    name: 'Responsable Programmes',
    role: 'Pôle Formations',
    linkedin: '#',
    email: 'formations@odc.mg',
  },
  {
    id: '3',
    name: 'Responsable Partenariats',
    role: 'Pôle Partenariats',
    linkedin: '#',
    email: 'partenariats@odc.mg',
  },
  {
    id: '4',
    name: 'Responsable Technique',
    role: 'Pôle Technique',
    linkedin: '#',
    email: 'tech@odc.mg',
  },
];

export function TeamSection() {
  return (
    <section id="equipe" aria-labelledby="team-title">
      <div className="text-center mb-12">
        <span className="inline-block rounded-full bg-odc-primary-soft text-odc-primary px-4 py-1.5 text-sm font-medium mb-4">
          Notre équipe
        </span>
        <h2 id="team-title" className="font-display text-3xl md:text-4xl font-bold mb-4">
          Les visages de l&apos;ODC
        </h2>
        <p className="text-odc-muted max-w-2xl mx-auto">
          Une équipe passionnée et engagée au service de la réussite de chaque
          apprenant.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEAM.map((member, index) => (
          <Card
            key={member.id}
            className="group overflow-hidden animate-fade-in hover:shadow-odc-lg transition-shadow"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="relative aspect-square bg-gradient-to-br from-odc-100 to-odc-200 dark:from-odc-950 dark:to-odc-900">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-6xl font-bold text-odc-primary/40">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <CardContent className="p-5">
              <h3 className="font-display font-semibold mb-1 line-clamp-1">
                {member.name}
              </h3>
              <p className="text-sm text-odc-muted mb-4">{member.role}</p>

              <div className="flex gap-2">
                {member.linkedin && (
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`LinkedIn de ${member.name}`}
                  >
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {member.email && (
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`Email de ${member.name}`}
                  >
                    <a href={`mailto:${member.email}`}>
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}