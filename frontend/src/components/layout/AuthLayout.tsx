import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { cn } from '@/utils/cn';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-odc-bg-light dark:bg-odc-bg-dark relative overflow-hidden">
      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* ====================================================================
          LEFT : Branding (desktop)
          ==================================================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-odc-primary via-odc-primary-dark to-odc-primary-dark overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-odc-primary font-bold text-xl shadow-odc-lg">
              ODC
            </div>
            <div>
              <div className="font-heading font-bold text-white text-lg">Orange Digital</div>
              <div className="text-white/80 text-sm">Center</div>
            </div>
          </div>

          {/* Hero */}
          <div>
            <h1 className="font-heading text-5xl font-bold text-white leading-tight mb-6">
              Bienvenue sur
              <br />
              <span className="text-white/90">ODC Platform</span>
            </h1>
            <p className="text-white/80 text-lg max-w-md leading-relaxed">
              La plateforme d'excellence pour gérer les formations, suivre les bénéficiaires
              et développer votre réseau professionnel.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              {[
                { value: '500+', label: 'Formations' },
                { value: '2K+', label: 'Apprenants' },
                { value: '50+', label: 'Partenaires' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-heading text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/70 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-white/60 text-sm">
            © {new Date().getFullYear()} Orange Digital Center
          </div>
        </div>
      </div>

      {/* ====================================================================
          RIGHT : Form
          ==================================================================== */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-odc-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-odc-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white font-bold text-xl shadow-odc-md">
                ODC
              </div>
              <div className="text-left">
                <div className="font-heading font-bold text-odc-text-light dark:text-odc-text-dark">
                  Orange Digital
                </div>
                <div className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
                  Center
                </div>
              </div>
            </div>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}