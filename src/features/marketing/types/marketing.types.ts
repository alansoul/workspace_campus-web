// WorkspaceApp, PricingTier, FaqItem interfaces

import { LucideIcon } from 'lucide-react';

export interface WorkspaceApp {
  id: string;
  name: string;
  brandTitle: string;
  tagline: string;
  href: string;
  icon: LucideIcon;
  badgeColor: string;
  borderColor: string;
  glowColor: string;
  description: string;
  previewSnippet: string;
  stats: string;
  tags: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  period: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}