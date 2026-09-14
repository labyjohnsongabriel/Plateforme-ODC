import { Target, Users, Award, TrendingUp, Globe, Heart } from 'lucide-react';
import { HeaderPublic } from '@/components/layout/HeaderPublic';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

export default function AboutPage() {
  const values = [
    { icon: Target, title: 'Excellence', description: 'Nous visons la qualité dans chaque formation', color: 'primary' },
    { icon: Users, title: 'Communauté', description: 'Nous croyons en la force du collectif', color: 'info' },
    { icon: Award, title: 'Reconnaissance', description: 'Nos certifications sont valorisées', color: 'success' },
    { icon: TrendingUp, title: 'Innovation', description: 'Nous formons aux technologies de demain', color: 'warning' },
    { icon: Globe, title: 'Accessibilité', description: 'La formation pour tous, partout', color: 'purple' },
    { icon: Heart, title: 'Passion', description: 'Nous aimons ce que nous faisons', color: 'error' },
  ];

  return (
    <div className="min-h-screen">
      <HeaderPublic />

      {/* HERO */}
      <section className="py-20 bg-gradient-to-br from-odc-primary to-odc-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <Badge variant="neutral" className="bg-white/20 text-white border-0 mb-6">À PROPOS</Badge>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
            Notre mission
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Former les talents malgaches aux métiers du numérique et créer un écosystème
            d'innovation durable pour Madagascar.
          </p>
        </div>
      </section>

      {/* HISTOIRE */}
      <section className="py-20 bg-odc-bg-light dark:bg-odc-bg-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="primary" className="mb-4">NOTRE HISTOIRE</Badge>
              <h2 className="font-heading text-3xl font-bold text-odc-text-light dark:text-odc-text-dark mb-6">
                10 ans d'excellence
              </h2>
              <div className="space-y-4 text-odc-text-muted-light dark:text-odc-text-muted-dark leading-relaxed">
                <p>
                  Depuis 2016, Orange Digital Center accompagne la transformation numérique
                  de Madagascar en formant des milliers de talents aux métiers du digital.
                </p>
                <p>
                  Notre approche pédagogique allie théorie et pratique, avec des formateurs
                  experts issus du monde professionnel.
                </p>
                <p>
                  Nous croyons que la formation est le pilier fondamental du développement
                  économique et social de notre pays.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '10+', label: 'Années', color: 'primary' },
                { value: '2K+', label: 'Apprenants', color: 'success' },
                { value: '500+', label: 'Formations', color: 'info' },
                { value: '95%', label: 'Satisfaction', color: 'warning' },
              ].map((item) => (
                <Card key={item.label} className="text-center">
                  <div className={`font-heading text-4xl font-bold text-odc-${item.color} mb-2`}>{item.value}</div>
                  <div className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark uppercase tracking-wider">{item.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="primary" className="mb-4">NOS VALEURS</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-odc-text-light dark:text-odc-text-dark mb-4">
              Ce qui nous anime
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} hover>
                  <div className={`w-12 h-12 rounded-xl bg-odc-${value.color}-bg text-odc-${value.color} flex items-center justify-center mb-4`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2 text-odc-text-light dark:text-odc-text-dark">
                    {value.title}
                  </h3>
                  <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}