import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Users, Award, Calendar, Sparkles,
  Target, TrendingUp, Shield, Zap, Globe, CheckCircle
} from 'lucide-react';
import { HeaderPublic } from '@/components/layout/HeaderPublic';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export default function HomePage() {
  const features = [
    { icon: BookOpen, title: 'Catalogue de formations', description: 'Découvrez notre offre complète', color: 'primary' },
    { icon: Award, title: 'Attestations certifiées', description: 'Obtenez vos certificats officiels', color: 'success' },
    { icon: Users, title: 'Réseautage', description: 'Connectez-vous avec la communauté', color: 'info' },
    { icon: Calendar, title: 'Suivi de sessions', description: 'Gérez vos formations facilement', color: 'warning' },
    { icon: Target, title: 'Évaluations', description: 'Suivez vos progressions', color: 'purple' },
    { icon: Shield, title: 'Sécurité', description: 'Vos données sont protégées', color: 'error' },
  ];

  const stats = [
    { value: '500+', label: 'Formations' },
    { value: '2K+', label: 'Apprenants' },
    { value: '50+', label: 'Partenaires' },
    { value: '95%', label: 'Satisfaction' },
  ];

  return (
    <div className="min-h-screen">
      <HeaderPublic />

      {/* HERO */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-odc-primary via-odc-primary-dark to-odc-primary-dark overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <Badge variant="neutral" className="bg-white/20 text-white border-0 mb-6 backdrop-blur-sm">
                <Sparkles size={12} />
                Nouvelle plateforme 2026
              </Badge>
              <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Formez-vous au<br />
                <span className="text-white/90">numérique</span>
              </h1>
              <p className="text-lg text-white/90 mb-8 max-w-lg leading-relaxed">
                Rejoignez la communauté Orange Digital Center et développez
                vos compétences dans les domaines du numérique.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button variant="secondary" size="lg" className="bg-white text-odc-primary hover:bg-white/90" icon={<ArrowRight size={18} />}>
                    Commencer gratuitement
                  </Button>
                </Link>
                <Link to="/formations-public">
                  <Button variant="secondary" size="lg" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    Voir les formations
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 mt-12">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="font-heading text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-white/70 text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden lg:block relative">
              <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                <div className="space-y-4">
                  {[
                    { icon: BookOpen, label: 'Formations', value: '500+', color: 'bg-blue-500' },
                    { icon: Award, label: 'Attestations', value: '1.2K+', color: 'bg-green-500' },
                    { icon: Users, label: 'Participants', value: '2K+', color: 'bg-purple-500' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                        <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-white`}>
                          <Icon size={22} />
                        </div>
                        <div className="flex-1">
                          <div className="text-white/70 text-xs uppercase tracking-wider">{item.label}</div>
                          <div className="text-white text-2xl font-bold">{item.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-odc-bg-light dark:bg-odc-bg-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="primary" className="mb-4">FONCTIONNALITÉS</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-odc-text-light dark:text-odc-text-dark mb-4">
              Tout pour réussir votre formation
            </h2>
            <p className="text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Une plateforme complète pour gérer votre parcours d'apprentissage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} hover className="group">
                  <div className={`w-12 h-12 rounded-xl bg-odc-${feature.color}-bg text-odc-${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2 text-odc-text-light dark:text-odc-text-dark">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-odc-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à commencer votre parcours ?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Rejoignez des milliers d'apprenants et développez vos compétences dès aujourd'hui.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg" className="bg-white text-odc-primary hover:bg-white/90" icon={<ArrowRight size={18} />}>
              S'inscrire gratuitement
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}