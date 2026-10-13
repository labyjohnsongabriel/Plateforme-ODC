import type { Metadata } from 'next';
import { HeroSlider } from '@/components/home/HeroSlider';
import { FeatureCards } from '@/components/home/FeatureCards';
import { StatsCounter } from '@/components/home/StatsCounter';
import { UpcomingEvents } from '@/components/home/UpcomingEvents';
import { LatestNews } from '@/components/home/LatestNews';
import { TestimonialCarousel } from '@/components/home/TestimonialCarousel';
import { CallToAction } from '@/components/home/CallToAction';

export const metadata: Metadata = {
  title: 'Accueil',
  description:
    'Orange Digital Center Madagascar — Formations numériques gratuites, suivi personnalisé, attestations numériques.',
};

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <FeatureCards />
      <StatsCounter />
      <UpcomingEvents />
      <LatestNews />
      <TestimonialCarousel />
      <CallToAction />
    </>
  );
}