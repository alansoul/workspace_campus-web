'use client';

import { useState, useRef, useEffect } from 'react';
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

interface NavbarProps {
  onScrollTo: (id: string) => void;
}

type ActiveDropdown = 'solutions' | 'products' | 'enterprise' | 'resources' | null;

export function MarketingNavbar({ onScrollTo }: NavbarProps) {
  const [activeMenu, setActiveMenu] = useState<ActiveDropdown>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close with Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setSearchOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    /* 1. Added Google Elevation Drop Shadow to bottom edge */
    <div
      ref={navRef}
      className="sticky top-0 z-50 bg-white border-b border-[#E8EAED] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
    >
      <header className="w-full px-6 lg:px-8 h-16 flex items-center justify-between bg-white">
        {/* Left Section: Logo + Nav links */}
        <div className="flex items-center">
          {/* Brand Logo & Wordmark */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {/* 2. Increased Northstar icon size to 42px */}
            <Image
              src={WORKSPACE_BRAND.logoSrc}
              alt="Northstar Workspace"
              width={42}
              height={42}
              className="w-10.5 h-10.5 object-contain"
              priority
            />
            <span className="text-[20px] tracking-[-0.02em] text-[#1F1F1F]">
              <span className="font-semibold text-[#1F1F1F]">Northstar</span>{' '}
              <span className="font-normal text-[#444746]">Workspace</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center ml-8 xl:ml-10 gap-1 xl:gap-2 text-[14px] font-medium">
            <button
              onClick={() => setActiveMenu(activeMenu === 'solutions' ? null : 'solutions')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md transition cursor-pointer ${
                activeMenu === 'solutions'
                  ? 'text-[#0B57D0] font-semibold'
                  : 'text-[#444746] hover:text-[#0B57D0] hover:bg-[#F8FAFD]'
              }`}
            >
              Solutions
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  activeMenu === 'solutions' ? 'rotate-180 text-[#0B57D0]' : 'text-[#5F6368]'
                }`}
              />
            </button>

            <button
              onClick={() => setActiveMenu(activeMenu === 'products' ? null : 'products')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md transition cursor-pointer ${
                activeMenu === 'products'
                  ? 'text-[#0B57D0] font-semibold'
                  : 'text-[#444746] hover:text-[#0B57D0] hover:bg-[#F8FAFD]'
              }`}
            >
              Products
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  activeMenu === 'products' ? 'rotate-180 text-[#0B57D0]' : 'text-[#5F6368]'
                }`}
              />
            </button>

            <button
              onClick={() => setActiveMenu(activeMenu === 'enterprise' ? null : 'enterprise')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md transition cursor-pointer ${
                activeMenu === 'enterprise'
                  ? 'text-[#0B57D0] font-semibold'
                  : 'text-[#444746] hover:text-[#0B57D0] hover:bg-[#F8FAFD]'
              }`}
            >
              Enterprise
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  activeMenu === 'enterprise' ? 'rotate-180 text-[#0B57D0]' : 'text-[#5F6368]'
                }`}
              />
            </button>

            <Link
              href="/academics"
              className="px-3 py-2 rounded-md text-[#444746] hover:text-[#0B57D0] hover:bg-[#F8FAFD] transition"
            >
              AI
            </Link>

            <button
              onClick={() => {
                setActiveMenu(null);
                onScrollTo('pricing');
              }}
              className="px-3 py-2 rounded-md text-[#444746] hover:text-[#0B57D0] hover:bg-[#F8FAFD] transition cursor-pointer"
            >
              Pricing
            </button>

            <button
              onClick={() => setActiveMenu(activeMenu === 'resources' ? null : 'resources')}
              className={`flex items-center gap-1 px-3 py-2 rounded-md transition cursor-pointer ${
                activeMenu === 'resources'
                  ? 'text-[#0B57D0] font-semibold'
                  : 'text-[#444746] hover:text-[#0B57D0] hover:bg-[#F8FAFD]'
              }`}
            >
              Resources
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  activeMenu === 'resources' ? 'rotate-180 text-[#0B57D0]' : 'text-[#5F6368]'
                }`}
              />
            </button>
          </nav>
        </div>

        {/* Right Action Section */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          {/* 3. Increased Search Icon size to 42px */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-11 h-11 rounded-full hover:bg-[#F1F3F4] transition-all flex items-center justify-center cursor-pointer p-0.5 group shrink-0"
            title="Search"
            aria-label="Search"
          >
            <Image
              src="/icons/northstar-premium-search.svg"
              alt="Search"
              width={42}
              height={42}
              className="w-10.5 h-auto object-contain drop-shadow-xs"
              priority
            />
          </button>

          <Link
            href="/admin"
            className="text-[14px] font-medium text-[#444746] hover:text-[#0B57D0] px-2 py-2 rounded-md transition hidden md:inline-block"
          >
            Admin console
          </Link>

          <Link
            href="/setup"
            className="text-[14px] font-medium text-[#444746] hover:bg-[#F1F3F4] px-4 py-2.5 rounded-full transition hidden sm:inline-block"
          >
            Contact sales
          </Link>

          <Link
            href="/setup"
            className="bg-[#0B57D0] hover:bg-[#0842A0] text-white text-[14px] font-medium px-6 py-2.5 rounded-full transition shadow-xs"
          >
            Start Free Trial
          </Link>

          {/* User Account Avatar */}
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-[#00897B] text-white flex items-center justify-center text-[14px] font-semibold hover:opacity-90 transition shadow-xs shrink-0"
            title="Account"
          >
            S
          </Link>
        </div>
      </header>

      {/* Floating Overlay Mega Menus */}
      {activeMenu && (
        <>
          <div
            className="fixed inset-0 top-16 bg-black/50 z-40 transition-opacity"
            onClick={() => setActiveMenu(null)}
          />

          <div className="absolute top-full left-0 w-full bg-white border-b border-[#E8EAED] shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            {activeMenu === 'solutions' && (
              <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
                <div className="flex justify-between items-center pb-6 border-b border-[#F1F3F4] mb-8">
                  <h3 className="text-[24px] font-normal text-[#1F1F1F]">Solutions</h3>
                  <button
                    onClick={() => setActiveMenu(null)}
                    className="p-1.5 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                  {SOLUTIONS_MENU.columns.map((col, idx) => (
                    <div key={idx} className="space-y-4">
                      <p className="text-[11px] font-bold text-[#5F6368] tracking-wider uppercase">
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
                              <p className="text-[14px] font-medium text-[#1F1F1F] group-hover:text-[#0B57D0] transition">
                                {item.title}
                              </p>
                              {item.desc && (
                                <p className="text-[12px] text-[#5F6368] mt-0.5 leading-snug">
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
              <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
                <div className="flex justify-between items-center pb-6 border-b border-[#F1F3F4] mb-8">
                  <h3 className="text-[24px] font-normal text-[#1F1F1F]">Products</h3>
                  <button
                    onClick={() => setActiveMenu(null)}
                    className="p-1.5 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {PRODUCTS_MENU.columns.map((col, idx) => (
                    <div key={idx} className="space-y-4">
                      <p className="text-[11px] font-bold text-[#5F6368] tracking-wider uppercase">
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
                              <p className="text-[14px] font-medium text-[#1F1F1F] group-hover:text-[#0B57D0] transition flex items-center gap-1.5">
                                {item.title}
                              </p>
                              {item.desc && (
                                <p className="text-[12px] text-[#5F6368] mt-0.5 leading-snug">
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
              <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
                <div className="flex justify-between items-center pb-6 border-b border-[#F1F3F4] mb-8">
                  <h3 className="text-[24px] font-normal text-[#1F1F1F]">Enterprise</h3>
                  <button
                    onClick={() => setActiveMenu(null)}
                    className="p-1.5 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-6 space-y-4">
                    {ENTERPRISE_MENU.featureCards.map((card, i) => (
                      <div key={i} className="p-6 rounded-2xl bg-[#F8FAFD] border border-[#DADCE0] space-y-2">
                        <h4 className="text-[17px] font-medium text-[#1F1F1F]">{card.title}</h4>
                        <p className="text-[13px] text-[#444746] leading-relaxed">{card.desc}</p>
                        <Link
                          href={card.href}
                          onClick={() => setActiveMenu(null)}
                          className="text-[13px] font-semibold text-[#0B57D0] hover:underline inline-flex items-center gap-1 pt-1"
                        >
                          {card.linkText} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-6 grid grid-cols-2 gap-8 pl-6 border-l border-[#F1F3F4]">
                    {ENTERPRISE_MENU.columns.map((col, idx) => (
                      <div key={idx} className="space-y-4">
                        <p className="text-[11px] font-bold text-[#5F6368] tracking-wider uppercase">
                          {col.heading}
                        </p>
                        <ul className="space-y-3.5 text-[14px]">
                          {col.items.map((item, i) => (
                            <li key={i}>
                              <Link
                                href={item.href}
                                onClick={() => setActiveMenu(null)}
                                className="text-[#1F1F1F] hover:text-[#0B57D0] transition"
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
              <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
                <div className="flex justify-between items-center pb-6 border-b border-[#F1F3F4] mb-8">
                  <h3 className="text-[24px] font-normal text-[#1F1F1F]">Resources</h3>
                  <button
                    onClick={() => setActiveMenu(null)}
                    className="p-1.5 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {RESOURCES_MENU.columns.map((col, idx) => (
                    <div key={idx} className="space-y-4">
                      <p className="text-[11px] font-bold text-[#5F6368] tracking-wider uppercase">
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
                              <p className="text-[14px] font-medium text-[#1F1F1F] group-hover:text-[#0B57D0] transition">
                                {item.title}
                              </p>
                              {item.desc && (
                                <p className="text-[12px] text-[#5F6368] mt-0.5 leading-snug">
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

      {/* AI Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-24 px-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#DADCE0] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#E8EAED] flex items-center gap-3">
              <Image
                src="/icons/northstar-premium-search.svg"
                alt="Search Lens"
                width={30}
                height={30}
                className="w-7.5 h-7.5 object-contain"
              />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask Gemini or search workspace resources, apps, features..."
                className="flex-1 text-[15px] text-[#1F1F1F] placeholder-[#747775] focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1.5 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-[#F8FAFD] space-y-4">
              <p className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider">Suggested Actions</p>
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                <Link
                  href="/academics"
                  onClick={() => setSearchOpen(false)}
                  className="p-3 bg-white rounded-xl border border-[#E8EAED] hover:border-[#0B57D0] transition flex items-center gap-2 text-[#1F1F1F]"
                >
                  <Search className="w-4 h-4 text-[#0B57D0]" /> Search Unit Notes
                </Link>
                <Link
                  href="/freelance"
                  onClick={() => setSearchOpen(false)}
                  className="p-3 bg-white rounded-xl border border-[#E8EAED] hover:border-[#0B57D0] transition flex items-center gap-2 text-[#1F1F1F]"
                >
                  <Search className="w-4 h-4 text-[#00C853]" /> Find Escrow Gigs
                </Link>
                <Link
                  href="/chat"
                  onClick={() => setSearchOpen(false)}
                  className="p-3 bg-white rounded-xl border border-[#E8EAED] hover:border-[#0B57D0] transition flex items-center gap-2 text-[#1F1F1F]"
                >
                  <Search className="w-4 h-4 text-[#7C4DFF]" /> Campus Channel Doubts
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setSearchOpen(false)}
                  className="p-3 bg-white rounded-xl border border-[#E8EAED] hover:border-[#0B57D0] transition flex items-center gap-2 text-[#1F1F1F]"
                >
                  <Search className="w-4 h-4 text-[#EA4335]" /> Admin Verification
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}