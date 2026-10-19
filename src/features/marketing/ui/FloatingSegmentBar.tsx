'use client';




import { useEffect, useLayoutEffect, useRef, useState } from 'react';




interface SegmentBarProps {
  activeTab: string;
  onSelect: (tabId: string) => void;
}




export function FloatingSegmentBar({
  activeTab,
  onSelect,
}: SegmentBarProps) {
  // Hide this separate sticky component whenever MarketingNavbar opens search.
  // MarketingNavbar toggles the `search-modal-open` class on document.body.
  const [searchModalOpen, setSearchModalOpen] = useState(false);


  useEffect(() => {
    const body = document.body;


    const syncSearchState = () => {
      setSearchModalOpen(body.classList.contains('search-modal-open'));
    };


    syncSearchState();


    const observer = new MutationObserver(syncSearchState);
    observer.observe(body, {
      attributes: true,
      attributeFilter: ['class'],
    });


    return () => observer.disconnect();
  }, []);
  // Toggle flag: flip to true whenever you want to restore the pricing tab
  const SHOW_PRICING = false;

  const tabs = [
    { id: 'included', label: "What's included" },
    { id: 'features', label: 'Premium features' },
    ...(SHOW_PRICING ? [{ id: 'pricing', label: 'Plans and pricing' }] : []),
    { id: 'faq', label: 'FAQ' },
  ];




  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});




  useLayoutEffect(() => {
    if (searchModalOpen) return;

    const nav = navRef.current;
    const indicator = indicatorRef.current;




    if (!nav || !indicator) return;




    const updateIndicator = () => {
      const button = buttonRefs.current[activeTab];




      if (!button) return;




      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;




      indicator.style.width = `${buttonWidth}px`;
      indicator.style.transform = `translate3d(${buttonLeft}px, 0, 0)`;
      indicator.style.opacity = '1';




      // Keep the active tab visible on mobile.
      if (window.innerWidth < 640) {
        const visibleLeft = nav.scrollLeft;
        const visibleRight = visibleLeft + nav.clientWidth;
        const buttonRight = buttonLeft + buttonWidth;




        if (buttonLeft < visibleLeft) {
          nav.scrollTo({
            left: Math.max(0, buttonLeft - 8),
            behavior: 'smooth',
          });
        } else if (buttonRight > visibleRight) {
          nav.scrollTo({
            left: buttonRight - nav.clientWidth + 8,
            behavior: 'smooth',
          });
        }
      }
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
  }, [activeTab, searchModalOpen]);




  if (searchModalOpen) return null;


  return (
    <div
      data-floating-segment-bar
      className="
        sticky top-16 z-50
        flex justify-center
        px-2 py-3
        pointer-events-none
        sm:px-3
      "
    >
      <nav
        ref={navRef}
        aria-label="Section navigation"
        className="
          relative isolate flex w-max min-w-0
          max-w-[calc(100vw-32px)]
          items-center gap-0
          overflow-x-auto overscroll-x-contain
          rounded-full border border-white/90
          bg-white/95 p-1
          shadow-[0_8px_32px_rgba(73,76,130,0.12)]
          backdrop-blur-xl pointer-events-auto
          touch-pan-x
          scrollbar-none [&::-webkit-scrollbar]:hidden
          sm:max-w-full sm:gap-1 sm:p-1.5
        "
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="
            pointer-events-none absolute left-0 top-1 bottom-1
            -z-10 rounded-full bg-[#E8F0FE]
            shadow-[0_1px_3px_rgba(11,87,208,0.08)]
            opacity-0
            transition-[transform,width]
            duration-200
            ease-[cubic-bezier(0.2,0,0,1)]
            motion-reduce:transition-none
            sm:top-1.5 sm:bottom-1.5
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
                relative z-10 shrink-0
                rounded-full bg-transparent
                px-2 py-2.5
                text-[11px] leading-tight whitespace-nowrap
                cursor-pointer select-none
                transition-colors duration-150
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-blue-500
                sm:px-6 sm:py-2.5
                sm:text-sm sm:leading-snug
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