
'use client';

import { useLayoutEffect, useRef } from 'react';

interface SegmentBarProps {
  activeTab: string;
  onSelect: (tabId: string) => void;
}

export function FloatingSegmentBar({
  activeTab,
  onSelect,
}: SegmentBarProps) {
  const tabs = [
    { id: 'included', label: "What's included" },
    { id: 'features', label: 'Premium features' },
    { id: 'pricing', label: 'Plans and pricing' },
    { id: 'faq', label: 'FAQ' },
  ];

  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;

    if (!nav || !indicator) return;

    const updateIndicator = () => {
      const button = buttonRefs.current[activeTab];

      if (!button) return;

      const navRect = nav.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      indicator.style.width = `${buttonRect.width}px`;
      indicator.style.transform = `translate3d(${
        buttonRect.left - navRect.left
      }px, 0, 0)`;
      indicator.style.opacity = '1';
    };

    updateIndicator();

    const observer = new ResizeObserver(updateIndicator);
    observer.observe(nav);

    Object.values(buttonRefs.current).forEach((button) => {
      if (button) observer.observe(button);
    });

    window.addEventListener('resize', updateIndicator);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeTab]);

  return (
    <div className="sticky top-16 z-50 flex justify-center px-3 py-3 pointer-events-none">
      <nav
        ref={navRef}
        aria-label="Section navigation"
        className="
          relative isolate flex w-max max-w-full items-center gap-1
          overflow-x-auto rounded-full
          border border-white/80 bg-white/70 p-1.5
          shadow-[0_8px_32px_rgba(73,76,130,0.10)]
          backdrop-blur-xl
          pointer-events-auto
          scrollbar-none [&::-webkit-scrollbar]:hidden
        "
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="
            pointer-events-none absolute left-0 top-1.5 bottom-1.5
            -z-10 rounded-full bg-[#E8F0FE]
            shadow-[0_1px_3px_rgba(11,87,208,0.08)]
            opacity-0
            transition-[transform,width]
            duration-200
            ease-[cubic-bezier(0.2,0,0,1)]
            motion-reduce:transition-none
          "
          style={{
            willChange: 'transform, width',
          }}
        />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={(element) => {
                buttonRefs.current[tab.id] = element;
              }}
              type="button"
              aria-current={isActive ? 'location' : undefined}
              onClick={() => onSelect(tab.id)}
              className={`
                relative z-10 shrink-0 rounded-full bg-transparent
                px-4 py-2.5 sm:px-6
                text-sm leading-snug whitespace-nowrap
                cursor-pointer select-none
                transition-colors duration-150
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-blue-500
                ${
                  isActive
                    ? 'font-semibold text-[#0B57D0]'
                    : 'font-normal text-[#444746] hover:text-[#1F1F1F]'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default FloatingSegmentBar;
