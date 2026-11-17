// src/app/(public)/formations/[slug]/components/FormationFaq.tsx
'use client';

import {
  HelpCircle, MessageCircle, Mail, ArrowRight, Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Formation } from '@/types/formation.types';

interface Props {
  formation: Formation;
}

export function FormationFaq({ formation }: Props) {
  const faq = formation.faq ?? buildDefaultFaq(formation);

  return (
    <section>
      {/* ═══════ En-tête ═══════ */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge
            variant="outline"
            className="mb-3 border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300"
          >
            <HelpCircle className="mr-1 h-3 w-3" aria-hidden />
            FAQ
          </Badge>
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Questions fréquentes
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tout ce qu&apos;il faut savoir avant de s&apos;inscrire
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Sparkles className="mr-1 h-3 w-3 text-orange-500" aria-hidden />
          {faq.length} question{faq.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* ═══════ Accordion ═══════ */}
      <Card className="overflow-hidden border-orange-200/40 dark:border-orange-900/40">
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {faq.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-border data-[state=open]:bg-orange-50/50 dark:data-[state=open]:bg-orange-950/20"
              >
                <AccordionTrigger className="px-5 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:no-underline hover:text-orange-600 dark:hover:text-orange-400">
                  <span className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                      {i + 1}
                    </span>
                    <span>{item.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4 pl-14 text-sm leading-relaxed text-muted-foreground">
                  {item.reponse}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* ═══════ CTA contact ═══════ */}
      <Card className="mt-6 overflow-hidden border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-900 dark:from-orange-950/40 dark:to-amber-950/30">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg">
            <MessageCircle className="h-6 w-6" aria-hidden />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-semibold text-foreground">
              Une autre question ?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Notre équipe vous répond sous 48h.
            </p>
          </div>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/contact">
              <Mail className="mr-2 h-4 w-4" aria-hidden />
              Nous contacter
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FAQ PAR DÉFAUT
   ═══════════════════════════════════════════════════════════════════════════ */

function buildDefaultFaq(formation: Formation) {
  return [
    {
      question: "Comment se déroule l'inscription ?",
      reponse:
        "Remplissez le formulaire en ligne. Votre demande sera examinée par notre équipe sous 48-72h. Vous recevrez une confirmation par email.",
    },
    {
      question: 'La formation est-elle certifiante ?',
      reponse: formation.certifiante
        ? "Oui, cette formation délivre une certification reconnue à l'issue de l'évaluation finale."
        : 'Cette formation délivre une attestation de participation, mais pas de certification formelle.',
    },
    {
      question: 'Quels sont les prérequis ?',
      reponse:
        formation.prerequis ||
        "Aucun prérequis spécifique. La motivation et l'assiduité sont essentielles.",
    },
    {
      question: 'Que se passe-t-il si je ne peux plus assister ?',
      reponse:
        'Contactez-nous au plus tôt. Selon la disponibilité, nous pourrons vous proposer une autre session.',
    },
    {
      question: 'Le matériel est-il fourni ?',
      reponse:
        'Selon les sessions, le matériel pédagogique peut être fourni sur place. Consultez les consignes de chaque session.',
    },
  ];
}