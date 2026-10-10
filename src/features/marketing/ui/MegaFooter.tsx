
'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  GraduationCap,
  ShieldCheck,
  UserRound,
  Scale,
  Globe2,
} from 'lucide-react';

type FooterLink = {
  label: string;
  href?: string;
  detail?: string;
};

type FooterGroup = {
  title: string;
  icon: typeof GraduationCap;
  links: FooterLink[];
};

const footerGroups: FooterGroup[] = [
  {
    title: 'Included applications',
    icon: GraduationCap,
    links: [
      {
        label: 'Aura Scholar',
        detail: 'Notes & previous-year papers',
        href: '/academics',
      },
      {
        label: 'Aura Pulse',
        detail: 'Campus channels',
        href: '/chat',
      },
      {
        label: 'Aura Forge',
        detail: 'Freelance marketplace',
        href: '/freelance',
      },
      {
        label: 'Gemini Academic Copilot',
        href: '/academics',
      },
    ],
  },
  {
    title: 'Security & management',
    icon: ShieldCheck,
    links: [
      { label: 'Campus Admin Console', href: '/admin' },
      { label: 'University Domain Verification', href: '/setup' },
      { label: 'Multi-Tenant Isolation' },
      { label: 'Escrow Ledger Vault' },
    ],
  },
  {
    title: 'Account access',
    icon: UserRound,
    links: [
      { label: 'Single Sign-On', href: '/login' },
      { label: 'Student Registration', href: '/register' },
      { label: 'Claim University Portal', href: '/setup' },
    ],
  },
  {
    title: 'Compliance & policy',
    icon: Scale,
    links: [
      { label: 'Privacy Policy' },
      { label: 'Terms of Service' },
      { label: 'System Status Dashboard' },
    ],
  },
];

export function MegaFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-[#DADCE0] bg-[#F8FAFD] text-[#444746]">
      {/* Subtle background accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(232,240,254,0.65),transparent_48%)]"
      />

      <div className="relative mx-auto w-full max-w-360 px-5 sm:px-8 lg:px-12">
        {/* Main footer */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-12 lg:py-16">
          {footerGroups.map((group) => {
            const Icon = group.icon;

            return (
              <div key={group.title} className="min-w-0">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DADCE0] bg-white text-[#0B57D0] shadow-sm">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>

                  <h2 className="text-[14px] font-semibold tracking-[-0.15px] text-[#202124] sm:text-[15px]">
                    {group.title}
                  </h2>
                </div>

                <ul className="space-y-1">
                  {group.links.map((item) => (
                    <li key={item.label}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="group flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-white hover:text-[#0B57D0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A73E8]"
                        >
                          <span className="min-w-0">
                            <span className="block text-[13px] font-medium leading-5 text-[#3C4043] transition-colors group-hover:text-[#0B57D0]">
                              {item.label}
                            </span>

                            {item.detail && (
                              <span className="mt-0.5 block text-[12px] leading-4.5 text-[#70757A]">
                                {item.detail}
                              </span>
                            )}
                          </span>

                          <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      ) : (
                        <div className="rounded-lg px-3 py-2.5">
                          <span className="block text-[13px] leading-5 text-[#70757A]">
                            {item.label}
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-5 border-t border-[#DADCE0] py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <Link
              href="/"
              className="w-fit text-[14px] font-semibold tracking-[-0.2px] text-[#202124] transition-colors hover:text-[#0B57D0]"
            >
              Northstar Workspace
            </Link>

            <p className="text-[12px] leading-5 text-[#70757A]">
              © {new Date().getFullYear()} Northstar Workspace. Built for
              connected campuses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[12px] text-[#5F6368]">
            <span className="inline-flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-[#70757A]" />
              English (India)
            </span>

            <span className="hidden h-4 w-px bg-[#DADCE0] sm:block" />

            <span className="text-[#70757A]">
              Campus collaboration, simplified.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
