import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { HeaderPublic } from '@/components/layout/HeaderPublic';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Badge } from '@/components/common/Badge';

const contactSchema = z.object({
  nom: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  sujet: z.string().min(3, 'Minimum 3 caractères'),
  message: z.string().min(10, 'Minimum 10 caractères').max(1000),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      toast.success('Message envoyé ! Nous vous répondrons sous 24h.');
      reset();
    } finally {
      setLoading(false);
    }
  };

  const contacts = [
    { icon: Mail, label: 'Email', value: 'contact@odc.mg', href: 'mailto:contact@odc.mg', color: 'primary' },
    { icon: Phone, label: 'Téléphone', value: '+261 34 12 345 67', href: 'tel:+261341234567', color: 'success' },
    { icon: MapPin, label: 'Adresse', value: 'Antananarivo, Madagascar', color: 'info' },
    { icon: Clock, label: 'Horaires', value: 'Lun-Ven : 8h-17h', color: 'warning' },
  ];

  return (
    <div className="min-h-screen">
      <HeaderPublic />

      {/* HERO */}
      <section className="py-16 bg-gradient-to-br from-odc-primary to-odc-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <Badge variant="neutral" className="bg-white/20 text-white border-0 mb-4">CONTACT</Badge>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Contactez-nous
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Une question ? Un projet ? Notre équipe est là pour vous aider.
          </p>
        </div>
      </section>

      {/* CONTENU */}
      <section className="py-16 bg-odc-bg-light dark:bg-odc-bg-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Info contact */}
            <div className="space-y-4">
              {contacts.map((contact) => {
                const Icon = contact.icon;
                const content = (
                  <Card hover padding="md">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-odc-${contact.color}-bg text-odc-${contact.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark uppercase tracking-wider mb-1">
                          {contact.label}
                        </div>
                        <div className="font-medium text-odc-text-light dark:text-odc-text-dark break-words">
                          {contact.value}
                        </div>
                      </div>
                    </div>
                  </Card>
                );

                return contact.href ? (
                  <a key={contact.label} href={contact.href} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={contact.label}>{content}</div>
                );
              })}
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-2">
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-odc-primary-soft dark:bg-odc-primary-soft/20 flex items-center justify-center text-odc-primary-dark">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-xl text-odc-text-light dark:text-odc-text-dark">
                      Envoyez-nous un message
                    </h2>
                    <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
                      Nous vous répondrons sous 24h
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nom complet"
                      placeholder="Jean Dupont"
                      error={errors.nom?.message}
                      required
                      {...register('nom')}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="jean@example.com"
                      error={errors.email?.message}
                      required
                      {...register('email')}
                    />
                  </div>

                  <Input
                    label="Sujet"
                    placeholder="Comment pouvons-nous vous aider ?"
                    error={errors.sujet?.message}
                    required
                    {...register('sujet')}
                  />

                  <Textarea
                    label="Message"
                    placeholder="Décrivez votre demande..."
                    rows={6}
                    maxLength={1000}
                    showCount
                    error={errors.message?.message}
                    required
                    {...register('message')}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                    icon={<Send size={16} />}
                  >
                    Envoyer le message
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}