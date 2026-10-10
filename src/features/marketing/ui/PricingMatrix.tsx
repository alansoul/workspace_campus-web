

'use client';



import { useState } from 'react';

import Image from 'next/image';

import Link from 'next/link';

import { Check, Crown, ArrowRight, Sparkles } from 'lucide-react';



type Workspace = {

  name: string;

  description: string;

  icon: string;

  iconClass: string;

};



type Plan = {

  name: string;

  subtitle: string;

  monthlyPrice: string;

  annualPrice: string;

  originalPrice?: string;

  description: string;

  workspaces: Workspace[];

  features: string[];

  ctaText: string;

  ctaHref: string;

  highlighted?: boolean;

};



const workspaceIcons = {

  university: '/icons/northstar-campus-icon.svg',

  freelance: '/icons/northstar-workflow-icon.svg',

  community: '/icons/northstar-circle-icon.svg',

};



const plans: Plan[] = [

  {

    name: 'Base',

    subtitle: 'For individuals getting started',

    monthlyPrice: '₹99',

    annualPrice: '₹79',

    description: 'Base includes:',

    workspaces: [

      {

        name: 'University Workspace',

        description: 'Core academic tools',

        icon: workspaceIcons.university,

        iconClass: 'bg-[#E8F0FE]',

      },

      {

        name: 'Freelance Workspace',

        description: 'Basic project collaboration',

        icon: workspaceIcons.freelance,

        iconClass: 'bg-[#FCE8E6]',

      },

      {

        name: 'Discord & Community',

        description: 'Join and participate',

        icon: workspaceIcons.community,

        iconClass: 'bg-[#E6F4EA]',

      },

    ],

    features: [

      'Create your profile and get started',

      'Access core features across available apps',

      'Basic messaging and collaboration',

      'Standard support',

    ],

    ctaText: 'Start Free Trial',

    ctaHref: '/register',

  },

  {

    name: 'Starter',

    subtitle: 'For active users and growing teams',

    monthlyPrice: '₹270',

    annualPrice: '₹225',

    description: 'All of Base, and:',

    workspaces: [

      {

        name: 'University Workspace',

        description: 'Classes, assignments and coordination',

        icon: workspaceIcons.university,

        iconClass: 'bg-[#E8F0FE]',

      },

      {

        name: 'Freelance Workspace',

        description: 'Projects, tasks and client collaboration',

        icon: workspaceIcons.freelance,

        iconClass: 'bg-[#FCE8E6]',

      },

      {

        name: 'Discord & Community',

        description: 'Create and manage communities',

        icon: workspaceIcons.community,

        iconClass: 'bg-[#E6F4EA]',

      },

    ],

    features: [

      'Advanced collaboration tools',

      'Task and project management',

      'Calendar and scheduling features',

      'Community moderation tools',

      'Priority support',

    ],

    ctaText: 'Start Free Trial',

    ctaHref: '/setup',

  },

  {

    name: 'Standard',

    subtitle: 'For established teams and institutions',

    monthlyPrice: '₹864',

    annualPrice: '₹725',

    originalPrice: '₹1080',

    description: 'All of Starter, and:',

    workspaces: [

      {

        name: 'University Workspace',

        description: 'Advanced academic management',

        icon: workspaceIcons.university,

        iconClass: 'bg-[#E8F0FE]',

      },

      {

        name: 'Freelance Workspace',

        description: 'Milestones, reviews and advanced tools',

        icon: workspaceIcons.freelance,

        iconClass: 'bg-[#FCE8E6]',

      },

      {

        name: 'Discord & Community',

        description: 'Advanced moderation and insights',

        icon: workspaceIcons.community,

        iconClass: 'bg-[#E6F4EA]',

      },

    ],

    features: [

      'Analytics and detailed insights',

      'Advanced user and role management',

      'Custom branding for your workspace',

      'Activity logs and audit history',

      'Faster priority support',

    ],

    ctaText: 'Start Free Trial',

    ctaHref: '/setup',

    highlighted: true,

  },

  {

    name: 'Enterprise',

    subtitle: 'For universities and large organizations',

    monthlyPrice: 'Custom',

    annualPrice: 'Custom',

    description: 'All features mentioned, and:',

    workspaces: [

      {

        name: 'University Workspace',

        description: 'Institution-wide management',

        icon: workspaceIcons.university,

        iconClass: 'bg-[#E8F0FE]',

      },

      {

        name: 'Freelance Workspace',

        description: 'Custom workflows and team oversight',

        icon: workspaceIcons.freelance,

        iconClass: 'bg-[#FCE8E6]',

      },

      {

        name: 'Discord & Community',

        description: 'Large community management',

        icon: workspaceIcons.community,

        iconClass: 'bg-[#E6F4EA]',

      },

    ],

    features: [

      'Custom onboarding and setup',

      'Dedicated account coordination',

      'Advanced role permissions',

      'Custom integrations (SSO, APIs)',

      'Service-level agreement options',

    ],

    ctaText: 'Contact sales',

    ctaHref: '/setup',

  },

];



export function PricingMatrix() {

  const [isAnnual, setIsAnnual] = useState(true);

  const [selectedPlan, setSelectedPlan] = useState('Standard');



  return (

    <section

      id="pricing"

      className="relative isolate w-full scroll-mt-24 overflow-hidden px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24"

    >

      {/* Soft ambient background */}

      <div

        aria-hidden="true"

        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"

      >

        <div className="absolute -top-32 left-[10%] h-105 w-150 rounded-full bg-[#E8F0FE]/65 blur-[100px]" />

        <div className="absolute top-[15%] right-[-10%] h-110 w-145 rounded-full bg-[#F3E8FD]/60 blur-[110px]" />

        <div className="absolute -bottom-25 left-[35%] h-75 w-120 rounded-full bg-[#E8F0FE]/40 blur-[100px]" />

      </div>



      <div className="mx-auto w-full max-w-[1600px]">

        {/* Section heading */}

        <header className="mx-auto mb-10 max-w-4xl space-y-4 text-center sm:mb-14">

          <h2 className="text-[34px] font-medium leading-[1.12] tracking-[-1.2px] text-[#202124] sm:text-[44px] lg:text-[52px] lg:tracking-[-1.8px]">

            Find the right plan for your

            <br className="hidden sm:inline" />{' '}

            <span className="font-semibold">

              workflow. Try it free for 14 days.

            </span>

          </h2>



          <p className="mx-auto max-w-2xl text-[15px] leading-7 text-[#5F6368] sm:text-base">

            Choose the Northstar Workspace edition that best fits your needs.

          </p>

        </header>



        {/* Pricing container */}

        <div className="rounded-3xl border border-[#E2E7F0] bg-white/80 p-3 shadow-[0_16px_60px_rgba(31,41,55,0.06)] backdrop-blur-sm sm:rounded-[28px] sm:p-5 lg:p-6">

          {/* Container toolbar */}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#E8EAED] px-2 pb-4 sm:px-3">

            <div className="flex items-center gap-3 sm:gap-4">

              <div

                className="flex items-center gap-3"

                aria-label="Included workspaces"

              >

                <Image

                  src={workspaceIcons.university}

                  alt="University Workspace"

                  width={30}

                  height={30}

                  className="h-7 w-7 object-contain"

                />

                <Image

                  src={workspaceIcons.freelance}

                  alt="Freelance Workspace"

                  width={30}

                  height={30}

                  className="h-7 w-7 object-contain"

                />

                <Image

                  src={workspaceIcons.community}

                  alt="Discord and Community"

                  width={30}

                  height={30}

                  className="h-7 w-7 object-contain"

                />

              </div>



              <div className="hidden items-center gap-2 border-l border-[#DADCE0] pl-4 text-[13px] font-medium text-[#1A73E8] sm:flex">

                <Sparkles className="h-4 w-4" />

                <span>Workspace access</span>

              </div>

            </div>



            {/* Billing toggle */}

            <div className="flex items-center gap-3">

              <span className="text-[13px] font-medium text-[#5F6368] sm:text-sm">

                Monthly

              </span>



              <button

                type="button"

                role="switch"

                aria-label="Annual billing"

                aria-checked={isAnnual}

                onClick={() => setIsAnnual((current) => !current)}

                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-[#1A73E8] focus-visible:ring-offset-2 ${

                  isAnnual ? 'bg-[#0B57D0]' : 'bg-[#DADCE0]'

                }`}

              >

                <span

                  className={`h-6 w-6 rounded-full bg-white shadow-sm ${

                    isAnnual ? 'translate-x-5' : 'translate-x-0'

                  }`}

                />

              </button>



              <div className="text-[13px] sm:text-sm">

                <span

                  className={`font-semibold ${

                    isAnnual ? 'text-[#202124]' : 'text-[#5F6368]'

                  }`}

                >

                  Annual

                </span>

                <span className="ml-1 hidden text-[#137333] sm:inline">

                  (Save 16% with one-year commitment)

                </span>

                <span className="ml-1 text-[#137333] sm:hidden">

                  (Save 16%)

                </span>

              </div>

            </div>

          </div>



          {/* Plan cards */}

          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">

            {plans.map((plan) => {

              const isSelected = selectedPlan === plan.name;

              const price = isAnnual

                ? plan.annualPrice

                : plan.monthlyPrice;



              return (

                <article

                  key={plan.name}

                  onClick={() => setSelectedPlan(plan.name)}

                  onKeyDown={(event) => {

                    if (event.key === 'Enter' || event.key === ' ') {

                      event.preventDefault();

                      setSelectedPlan(plan.name);

                    }

                  }}

                  role="button"

                  tabIndex={0}

                  aria-pressed={isSelected}

                  className={`relative flex min-w-0 cursor-pointer flex-col rounded-[22px] bg-white p-5 outline-none focus-visible:ring-2 focus-visible:ring-[#1A73E8] focus-visible:ring-offset-2 sm:p-6 lg:p-5 2xl:p-6 ${

                    isSelected

                      ? 'border-2 border-[#1A73E8] shadow-[0_8px_32px_rgba(26,115,232,0.10)]'

                      : 'border border-[#DADCE0] hover:border-[#BDC1C6]'

                  }`}

                >

                  {/* Plan identity */}

                  <div className="mb-5">

                    <div className="mb-3 flex h-7 items-center">

                      {plan.highlighted ? (

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FE] px-3 py-1.5 text-xs font-semibold tracking-[0.1px] text-[#0B57D0]">

                          <Crown className="h-3.5 w-3.5" />

                          Recommended

                        </span>

                      ) : null}

                    </div>



                    <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.55px] text-[#202124] sm:text-2xl">

                      {plan.name}

                    </h3>



                    <p className="mt-2 min-h-10 text-[13px] leading-5 text-[#5F6368]">

                      {plan.subtitle}

                    </p>



                    {/* Price */}

                    <div className="mt-4 flex min-h-12 flex-wrap items-baseline gap-x-2 gap-y-1">

                      <span className="text-[36px] font-semibold leading-none tracking-[-1.2px] text-[#202124] sm:text-[40px]">

                        {price}

                      </span>



                      {isAnnual && plan.originalPrice ? (

                        <span className="text-[13px] font-normal text-[#70757A] line-through">

                          {plan.originalPrice}

                        </span>

                      ) : null}

                    </div>



                    <p className="mt-2 min-h-5 text-[12px] leading-5 text-[#70757A]">

                      {price === 'Custom'

                        ? 'Contact us for pricing'

                        : 'per user/month'}

                    </p>

                  </div>



                  {/* Call to action */}

                  <Link

                    href={plan.ctaHref}

                    onClick={(event) => event.stopPropagation()}

                    className={`flex h-12 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold ${

                      isSelected

                        ? 'bg-[#0B57D0] text-white hover:bg-[#0842A0]'

                        : 'border border-[#DADCE0] bg-white text-[#0B57D0] hover:bg-[#F8FAFD] hover:border-[#1A73E8]'

                    }`}

                  >

                    <span>{plan.ctaText}</span>

                    <ArrowRight className="h-4 w-4 shrink-0" />

                  </Link>



                  {/* Included workspaces */}

                  <div className="mt-6 border-t border-[#E8EAED] pt-5">

                    <h4 className="mb-4 text-[13px] font-semibold leading-5 text-[#202124]">

                      {plan.description}

                    </h4>



                    <ul className="space-y-3.5">

                      {plan.workspaces.map((workspace) => (

                        <li

                          key={workspace.name}

                          className="flex min-w-0 items-center gap-3"

                        >

                          <div

                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${workspace.iconClass}`}

                          >

                            <Image

                              src={workspace.icon}

                              alt=""

                              width={22}

                              height={22}

                              className="h-5.5 w-5.5 object-contain"

                            />

                          </div>



                          <div className="min-w-0">

                            <p className="truncate text-[13px] font-semibold leading-5 tracking-[-0.1px] text-[#202124]">

                              {workspace.name}

                            </p>

                            <p className="truncate text-[12px] font-normal leading-4.5 text-[#5F6368]">

                              {workspace.description}

                            </p>

                          </div>

                        </li>

                      ))}

                    </ul>

                  </div>



                  {/* Plan features */}

                  <div className="mt-5 flex-1 border-t border-[#E8EAED] pt-5">

                    <ul className="space-y-3">

                      {plan.features.map((feature) => (

                        <li

                          key={feature}

                          className="flex items-start gap-2.5 text-[13px] leading-4.75 text-[#5F6368]"

                        >

                          <Check

                            className="mt-0.5 h-4 w-4 shrink-0 text-[#1A73E8]"

                            strokeWidth={2}

                            aria-hidden="true"

                          />

                          <span>{feature}</span>

                        </li>

                      ))}

                    </ul>

                  </div>

                </article>

              );

            })}

          </div>



          {/* Pricing disclaimer */}

          <footer className="px-2 pb-1 pt-6 text-center">

            <p className="text-[12px] leading-5 text-[#70757A]">

              All plans billed monthly or annually. All prices ₹INR.

              Pricing shown per user/month.

            </p>

          </footer>

        </div>

      </div>

    </section>

  );

}
