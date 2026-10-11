'use client';




import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, X, ArrowRight, Search } from 'lucide-react';
import { WORKSPACE_BRAND } from '../data/brand.config';
import {
  SOLUTIONS_MENU,
  PRODUCTS_MENU,
  ENTERPRISE_MENU,
  RESOURCES_MENU,
} from '../data/navigation.data';
import { createPortal } from 'react-dom';




interface NavbarProps {
  onScrollTo: (id: string) => void;
}




type ActiveDropdown =
  | 'solutions'
  | 'products'
  | 'enterprise'
  | 'resources'
  | null;




export function MarketingNavbar({ onScrollTo }: NavbarProps) {
  const [activeMenu, setActiveMenu] = useState<ActiveDropdown>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef<HTMLDivElement>(null);


  // Synchronize before paint so mobile browsers never paint the floating bar over the modal.
  useLayoutEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    const previousBodyStyles = {
      overflow: body.style.overflow,
      touchAction: body.style.touchAction,
    };
    const previousHtmlStyles = {
      overflow: html.style.overflow,
      touchAction: html.style.touchAction,
    };

    body.classList.toggle('search-modal-open', searchOpen);
    html.classList.toggle('search-modal-open', searchOpen);

    window.dispatchEvent(
      new CustomEvent('northstar:search-toggle', {
        detail: { open: searchOpen },
      })
    );

    if (searchOpen) {
      body.style.overflow = 'hidden';
      body.style.touchAction = 'none';
      html.style.overflow = 'hidden';
      html.style.touchAction = 'none';
    }

    return () => {
      body.style.overflow = previousBodyStyles.overflow;
      body.style.touchAction = previousBodyStyles.touchAction;
      html.style.overflow = previousHtmlStyles.overflow;
      html.style.touchAction = previousHtmlStyles.touchAction;

      body.classList.remove('search-modal-open');
      html.classList.remove('search-modal-open');

      window.dispatchEvent(
        new CustomEvent('northstar:search-toggle', {
          detail: { open: false },
        })
      );
    };
  }, [searchOpen]);

  // Close menus when clicking outside the navbar.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        navRef.current &&
        !navRef.current.contains(e.target as Node)
      ) {
        setActiveMenu(null);
      }
    }




    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);




  // Close menus and search using Escape.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setSearchOpen(false);
      }




      // Google-style keyboard shortcut for opening search.
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === 'k'
      ) {
        e.preventDefault();
        setSearchOpen(true);
        setActiveMenu(null);
      }
    }




    document.addEventListener('keydown', handleKeyDown);
    return () =>
      document.removeEventListener('keydown', handleKeyDown);
  }, []);




  return (
    <div
      ref={navRef}
      className="sticky top-0 z-50 border-b border-[#E8EAED] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
    >
      {/* Hide the sticky section bar at the CSS level while the search portal is open.
          This avoids mobile browser compositor layers painting it over the modal. */}
      <style>{`
        body.search-modal-open [data-floating-segment-bar],
        html.search-modal-open [data-floating-segment-bar] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
      <header className="flex h-16 w-full items-center justify-between gap-2 bg-white px-3 sm:gap-4 sm:px-5 lg:px-8">
        {/* Brand: always visible on mobile and desktop */}
        <div className="flex min-w-0 flex-1 items-center">
          <Link
            href="/"
            aria-label="Northstar Workspace home"
            className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2.5"
          >
            <Image
              src={WORKSPACE_BRAND.logoSrc}
              alt=""
              width={42}
              height={42}
              priority
              className="h-10 w-10 shrink-0 object-contain sm:h-10 sm:w-10"
            />




            <span className="whitespace-nowrap text-[18px] tracking-[-0.04em] text-[#1F1F1F] sm:text-[20px] sm:tracking-[-0.02em]">
  <span className="font-semibold">Northstar</span>{' '}
  <span className="font-normal text-[#444746]">
    Workspace
  </span>
</span>
          </Link>




          {/* Desktop navigation */}
          <nav className="ml-5 hidden items-center gap-1 text-sm font-medium lg:flex xl:ml-8 xl:gap-2">
            <button
              type="button"
              onClick={() =>
                setActiveMenu(
                  activeMenu === 'solutions' ? null : 'solutions'
                )
              }
              aria-expanded={activeMenu === 'solutions'}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-[#444746] transition hover:bg-[#F8FAFD] hover:text-[#0B57D0]"
            >
              Solutions
              <ChevronDown className="h-4 w-4" />
            </button>




            <button
              type="button"
              onClick={() =>
                setActiveMenu(
                  activeMenu === 'products' ? null : 'products'
                )
              }
              aria-expanded={activeMenu === 'products'}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-[#444746] transition hover:bg-[#F8FAFD] hover:text-[#0B57D0]"
            >
              Products
              <ChevronDown className="h-4 w-4" />
            </button>




            <button
              type="button"
              onClick={() =>
                setActiveMenu(
                  activeMenu === 'enterprise' ? null : 'enterprise'
                )
              }
              aria-expanded={activeMenu === 'enterprise'}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-[#444746] transition hover:bg-[#F8FAFD] hover:text-[#0B57D0]"
            >
              Enterprise
              <ChevronDown className="h-4 w-4" />
            </button>




            <Link
              href="/academics"
              className="rounded-md px-3 py-2 text-[#444746] transition hover:bg-[#F8FAFD] hover:text-[#0B57D0]"
            >
              AI
            </Link>




            <button
              type="button"
              onClick={() => {
                setActiveMenu(null);
                onScrollTo('pricing');
              }}
              className="rounded-md px-3 py-2 text-[#444746] transition hover:bg-[#F8FAFD] hover:text-[#0B57D0]"
            >
              Pricing
            </button>




            <button
              type="button"
              onClick={() =>
                setActiveMenu(
                  activeMenu === 'resources' ? null : 'resources'
                )
              }
              aria-expanded={activeMenu === 'resources'}
              className="flex items-center gap-1 rounded-md px-3 py-2 text-[#444746] transition hover:bg-[#F8FAFD] hover:text-[#0B57D0]"
            >
              Resources
              <ChevronDown className="h-4 w-4" />
            </button>
          </nav>
        </div>




        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3 lg:gap-4">
          {/* Search: visible at every screen size */}
          <button
  type="button"
  onClick={() => {
    setSearchOpen(true);
    setActiveMenu(null);
  }}
  aria-label="Search Northstar Workspace"
  title="Search"
  className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition duration-200 hover:bg-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:h-11 sm:w-11"
>
  <Image
    src="/icons/northstar-premium-search.svg"
    alt=""
    width={42}
    height={42}
    priority
    className="h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-105"
  />
</button>




          {/* Desktop/tablet actions: hidden on mobile */}
          <Link
            href="/admin"
            className="hidden rounded-md px-2 py-2 text-sm font-medium text-[#444746] transition hover:text-[#0B57D0] md:inline-block"
          >
            Admin console
          </Link>




          <Link
            href="/setup"
            className="hidden whitespace-nowrap rounded-full px-3 py-2.5 text-sm text-[#444746] transition hover:bg-[#F1F3F4] sm:inline-block"
          >
            Contact sales
          </Link>




          <Link
            href="/setup"
            className="hidden h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#0B57D0] px-3 text-[12px] font-semibold text-white shadow-sm transition duration-200 hover:bg-[#0842A0] active:scale-[0.98] sm:inline-flex sm:h-10 sm:px-5 sm:text-sm lg:px-6"
          >
            <span className="sm:hidden">Start trial</span>
            <span className="hidden sm:inline">Start Free Trial</span>
          </Link>




          <Link
            href="/dashboard"
            aria-label="Account"
            title="Account"
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00897B] text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:flex sm:h-9 sm:w-9"
          >
            S
          </Link>
        </div>
      </header>




      {/* Floating Overlay Mega Menus */}
      {activeMenu && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-black/50 transition-opacity"
            onClick={() => setActiveMenu(null)}
          />




          <div className="absolute left-0 top-full z-50 w-full animate-in fade-in slide-in-from-top-1 border-b border-[#E8EAED] bg-white shadow-2xl duration-150">
            {activeMenu === 'solutions' && (
              <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                <div className="mb-8 flex items-center justify-between border-b border-[#F1F3F4] pb-6">
                  <h3 className="text-2xl font-normal text-[#1F1F1F]">
                    Solutions
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveMenu(null)}
                    aria-label="Close solutions menu"
                    className="cursor-pointer rounded-full p-1.5 text-[#5F6368] transition hover:bg-[#F1F3F4]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>




                <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
                  {SOLUTIONS_MENU.columns.map((col, idx) => (
                    <div key={idx} className="space-y-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
                        {col.heading}
                      </p>
                      <ul className="space-y-4">
                        {col.items.map((item, i) => (
                          <li key={i}>
                            <Link
                              href={item.href}
                              onClick={() => setActiveMenu(null)}
                              className="group block"
                            >
                              <p className="text-sm font-medium text-[#1F1F1F] transition group-hover:text-[#0B57D0]">
                                {item.title}
                              </p>
                              {item.desc && (
                                <p className="mt-0.5 text-xs leading-snug text-[#5F6368]">
                                  {item.desc}
                                </p>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}




            {activeMenu === 'products' && (
              <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                <div className="mb-8 flex items-center justify-between border-b border-[#F1F3F4] pb-6">
                  <h3 className="text-2xl font-normal text-[#1F1F1F]">
                    Products
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveMenu(null)}
                    aria-label="Close products menu"
                    className="cursor-pointer rounded-full p-1.5 text-[#5F6368] transition hover:bg-[#F1F3F4]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>




                <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                  {PRODUCTS_MENU.columns.map((col, idx) => (
                    <div key={idx} className="space-y-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
                        {col.heading}
                      </p>
                      <ul className="space-y-5">
                        {col.items.map((item, i) => (
                          <li key={i}>
                            <Link
                              href={item.href}
                              onClick={() => setActiveMenu(null)}
                              className="group block"
                            >
                              <p className="flex items-center gap-1.5 text-sm font-medium text-[#1F1F1F] transition group-hover:text-[#0B57D0]">
                                {item.title}
                              </p>
                              {item.desc && (
                                <p className="mt-0.5 text-xs leading-snug text-[#5F6368]">
                                  {item.desc}
                                </p>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}




            {activeMenu === 'enterprise' && (
              <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                <div className="mb-8 flex items-center justify-between border-b border-[#F1F3F4] pb-6">
                  <h3 className="text-2xl font-normal text-[#1F1F1F]">
                    Enterprise
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveMenu(null)}
                    aria-label="Close enterprise menu"
                    className="cursor-pointer rounded-full p-1.5 text-[#5F6368] transition hover:bg-[#F1F3F4]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>




                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                  <div className="space-y-4 lg:col-span-6">
                    {ENTERPRISE_MENU.featureCards.map((card, i) => (
                      <div
                        key={i}
                        className="space-y-2 rounded-2xl border border-[#DADCE0] bg-[#F8FAFD] p-6"
                      >
                        <h4 className="text-[17px] font-medium text-[#1F1F1F]">
                          {card.title}
                        </h4>
                        <p className="text-[13px] leading-relaxed text-[#444746]">
                          {card.desc}
                        </p>
                        <Link
                          href={card.href}
                          onClick={() => setActiveMenu(null)}
                          className="inline-flex items-center gap-1 pt-1 text-[13px] font-semibold text-[#0B57D0] hover:underline"
                        >
                          {card.linkText}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>




                  <div className="grid grid-cols-2 gap-8 border-l border-[#F1F3F4] pl-6 lg:col-span-6">
                    {ENTERPRISE_MENU.columns.map((col, idx) => (
                      <div key={idx} className="space-y-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
                          {col.heading}
                        </p>
                        <ul className="space-y-3.5 text-sm">
                          {col.items.map((item, i) => (
                            <li key={i}>
                              <Link
                                href={item.href}
                                onClick={() => setActiveMenu(null)}
                                className="text-[#1F1F1F] transition hover:text-[#0B57D0]"
                              >
                                {item.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}




            {activeMenu === 'resources' && (
              <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                <div className="mb-8 flex items-center justify-between border-b border-[#F1F3F4] pb-6">
                  <h3 className="text-2xl font-normal text-[#1F1F1F]">
                    Resources
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveMenu(null)}
                    aria-label="Close resources menu"
                    className="cursor-pointer rounded-full p-1.5 text-[#5F6368] transition hover:bg-[#F1F3F4]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>




                <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                  {RESOURCES_MENU.columns.map((col, idx) => (
                    <div key={idx} className="space-y-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
                        {col.heading}
                      </p>
                      <ul className="space-y-4">
                        {col.items.map((item, i) => (
                          <li key={i}>
                            <Link
                              href={item.href}
                              onClick={() => setActiveMenu(null)}
                              className="group block"
                            >
                              <p className="text-sm font-medium text-[#1F1F1F] transition group-hover:text-[#0B57D0]">
                                {item.title}
                              </p>
                              {item.desc && (
                                <p className="mt-0.5 text-xs leading-snug text-[#5F6368]">
                                  {item.desc}
                                </p>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}








     
      {/* AI Search Modal — MOBILE + DESKTOP FIX */}
      {searchOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            data-search-modal-portal
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2147483647,
              isolation: 'isolate',
            }}
            className="fixed inset-0 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/50 px-3 py-4 sm:px-4 sm:py-8"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setSearchOpen(false);
              }
            }}
            onTouchMove={(e) => {
              // Prevent touch gestures on the backdrop from scrolling the page behind it.
              if (e.target === e.currentTarget) {
                e.preventDefault();
              }
            }}
          >
            {/* Modal panel */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Search Northstar Workspace"
              style={{
                position: 'relative',
                zIndex: 2147483647,
              }}
              className="w-full max-w-2xl animate-in fade-in zoom-in-95 overflow-hidden rounded-3xl border border-[#DADCE0] bg-white shadow-2xl duration-150"
            >
              {/* Search input header */}
              <div className="flex min-h-17 items-center gap-3 border-b border-[#E8EAED] p-3 sm:p-4">
                <Image
                  src="/icons/northstar-premium-search.svg"
                  alt=""
                  width={30}
                  height={30}
                  className="h-7 w-7 shrink-0 object-contain"
                />




                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Northstar Workspace..."
                  aria-label="Search Northstar Workspace"
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1F1F1F] outline-none placeholder:text-[#747775]"
                />




                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#5F6368] transition hover:bg-[#F1F3F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>




              {/* Suggested actions */}
              <div className="space-y-4 bg-[#F8FAFD] p-4 sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368]">
                  Suggested Actions
                </p>




                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <Link
                    href="/academics"
                    onClick={() => setSearchOpen(false)}
                    className="flex min-h-12 items-center gap-3 rounded-xl border border-[#E8EAED] bg-white p-3 text-[#1F1F1F] transition-colors hover:border-[#0B57D0] hover:bg-[#F8FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Search className="h-5 w-5 shrink-0 text-[#0B57D0]" />
                    <span>Search Unit Notes</span>
                  </Link>




                  <Link
                    href="/freelance"
                    onClick={() => setSearchOpen(false)}
                    className="flex min-h-12 items-center gap-3 rounded-xl border border-[#E8EAED] bg-white p-3 text-[#1F1F1F] transition-colors hover:border-[#0B57D0] hover:bg-[#F8FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Search className="h-5 w-5 shrink-0 text-[#00C853]" />
                    <span>Find Escrow Gigs</span>
                  </Link>




                  <Link
                    href="/chat"
                    onClick={() => setSearchOpen(false)}
                    className="flex min-h-12 items-center gap-3 rounded-xl border border-[#E8EAED] bg-white p-3 text-[#1F1F1F] transition-colors hover:border-[#0B57D0] hover:bg-[#F8FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Search className="h-5 w-5 shrink-0 text-[#7C4DFF]" />
                    <span>Campus Channel Doubts</span>
                  </Link>




                  <Link
                    href="/admin"
                    onClick={() => setSearchOpen(false)}
                    className="flex min-h-12 items-center gap-3 rounded-xl border border-[#E8EAED] bg-white p-3 text-[#1F1F1F] transition-colors hover:border-[#0B57D0] hover:bg-[#F8FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Search className="h-5 w-5 shrink-0 text-[#EA4335]" />
                    <span>Admin Verification</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          // REQUIRED: Render outside the navbar's stacking context.
          document.body
        )}








    </div>
  );
}