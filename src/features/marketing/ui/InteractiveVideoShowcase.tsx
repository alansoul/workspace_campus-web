
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Database,
  Heart,
  Mouse,
  Palette,
  Sparkles,
  Users,
} from "lucide-react";
import '../styles/InteractiveVideoShowcase.css';

const features = [
  {
    title: "AI companions",
    description: "Get a personal AI tutor to learn, plan and stay on track.",
    icon: Sparkles,
    tone: "mint",
    accessory: "laptop",
    tag: "PERSONAL AI",
  },
  {
    title: "Smart learning",
    description:
      "Interactive courses, real-world projects and hands-on practice.",
    icon: BookOpen,
    tone: "blue",
    accessory: "headphones",
    tag: "LEARN & GROW",
  },
  {
    title: "Knowledge hub",
    description: "Your ideas, notes and resources — all in one place.",
    icon: Database,
    tone: "violet",
    accessory: "cap",
    tag: "YOUR KNOWLEDGE",
  },
  {
    title: "Creative studio",
    description:
      "Turn your ideas into amazing content with AI-powered tools.",
    icon: Palette,
    tone: "peach",
    accessory: "paint",
    tag: "MAKE SOMETHING",
  },
  {
    title: "Grow together",
    description:
      "Join a global community to learn, share and build meaningful connections.",
    icon: Users,
    tone: "pink",
    accessory: "heart",
    tag: "YOUR COMMUNITY",
  },
] as const;

type Accessory = (typeof features)[number]["accessory"];

function Teddy({ accessory }: { accessory: Accessory }) {
  const id = `northstar-${accessory}`;

  return (
    <svg
      viewBox="0 0 240 230"
      className={`teddy-art teddy-art--${accessory}`}
      role="img"
      aria-label={`${accessory} teddy bear`}
    >
      <defs>
        <radialGradient id={`${id}-fur`} cx="35%" cy="24%" r="80%">
          <stop offset="0%" stopColor="#fffefa" />
          <stop offset="60%" stopColor="#fff0e9" />
          <stop offset="100%" stopColor="#ded4f7" />
        </radialGradient>
        <linearGradient id={`${id}-purple`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b9a1ff" />
          <stop offset="1" stopColor="#7145ee" />
        </linearGradient>
        <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#83c5ff" />
          <stop offset="1" stopColor="#3169ef" />
        </linearGradient>
      </defs>

      {/* Ears */}
      <circle cx="75" cy="66" r="29" fill={`url(#${id}-fur)`} />
      <circle cx="165" cy="66" r="29" fill={`url(#${id}-fur)`} />
      <circle cx="75" cy="66" r="15" fill="#f4bdcd" />
      <circle cx="165" cy="66" r="15" fill="#f4bdcd" />

      {/* Body and arms */}
      <ellipse cx="120" cy="159" rx="64" ry="52" fill={`url(#${id}-fur)`} />
      <ellipse cx="79" cy="168" rx="23" ry="28" fill="#f8eee9" />
      <ellipse cx="161" cy="168" rx="23" ry="28" fill="#f8eee9" />

      {/* Head */}
      <ellipse cx="120" cy="102" rx="68" ry="63" fill={`url(#${id}-fur)`} />
      <ellipse cx="120" cy="125" rx="36" ry="25" fill="#fff9f4" />

      {/* Cheeks */}
      <ellipse cx="76" cy="116" rx="14" ry="9" fill="#ff9fbe" opacity=".5" />
      <ellipse cx="164" cy="116" rx="14" ry="9" fill="#ff9fbe" opacity=".5" />

      {/* Eyes and highlights */}
      <ellipse cx="96" cy="97" rx="6.5" ry="8.5" fill="#30243b" />
      <ellipse cx="144" cy="97" rx="6.5" ry="8.5" fill="#30243b" />
      <circle cx="98" cy="94" r="2.5" fill="white" />
      <circle cx="146" cy="94" r="2.5" fill="white" />

      {/* Nose and smile */}
      <ellipse cx="120" cy="115" rx="6" ry="4.5" fill="#75475e" />
      <path
        d="M120 119 Q117 128 109 125 M120 119 Q123 128 131 125"
        fill="none"
        stroke="#75475e"
        strokeWidth="2.7"
        strokeLinecap="round"
      />

      {/* Laptop */}
      {accessory === "laptop" && (
        <g transform="translate(51 146) rotate(-8)">
          <rect
            x="0"
            y="0"
            width="70"
            height="44"
            rx="5"
            fill="#c9e4ff"
            stroke="#fff"
            strokeWidth="2"
          />
          <rect x="5" y="5" width="60" height="33" rx="3" fill="#6caaff" />
          <path
            d="M-5 44 H75 L66 50 H4 Z"
            fill="#e0e9fa"
            stroke="#fff"
          />
          <path
            d="M35 13 L39 21 L47 22 L41 28 L42 35 L35 31 L28 35 L29 28 L23 22 L31 21 Z"
            fill="#fff"
          />
        </g>
      )}

      {/* Headphones */}
      {accessory === "headphones" && (
        <g>
          <path
            d="M55 103 V79 A65 65 0 0 1 185 79 V103"
            fill="none"
            stroke="#8056f6"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M58 83 A62 62 0 0 1 182 83"
            fill="none"
            stroke="#d3bfff"
            strokeWidth="5"
          />
          <rect x="44" y="84" width="27" height="47" rx="11" fill={`url(#${id}-purple)`} />
          <rect x="169" y="84" width="27" height="47" rx="11" fill={`url(#${id}-purple)`} />
          <rect x="51" y="92" width="12" height="31" rx="6" fill="#d9c9ff" />
          <rect x="177" y="92" width="12" height="31" rx="6" fill="#d9c9ff" />
        </g>
      )}

      {/* Knowledge explorer cap */}
      {accessory === "cap" && (
        <g>
          <path
            d="M59 67 Q64 18 120 16 Q176 18 181 67 L165 76 H75 Z"
            fill={`url(#${id}-purple)`}
          />
          <path
            d="M59 64 Q120 42 181 64 Q166 82 120 81 Q76 80 59 64"
            fill="#7043e7"
          />
          <circle cx="120" cy="47" r="15" fill="#b9a1ff" />
          <path
            d="M120 37 L124 44 L132 47 L124 50 L120 57 L116 50 L108 47 L116 44 Z"
            fill="#fff"
          />
        </g>
      )}

      {/* Paintbrush and palette */}
      {accessory === "paint" && (
        <g transform="translate(151 144) rotate(-18)">
          <path
            d="M4 1 L17 -29 L24 -25 L10 6 Z"
            fill="#a887ff"
            stroke="#fff"
            strokeWidth="2"
          />
          <path d="M14 -30 Q20 -43 25 -29 L21 -21 Z" fill="#ffd36b" />
          <ellipse
            cx="18"
            cy="24"
            rx="26"
            ry="18"
            fill="#ffd8e8"
            stroke="#fff"
            strokeWidth="2"
          />
          <circle cx="6" cy="19" r="4" fill="#ff669e" />
          <circle cx="18" cy="13" r="4" fill="#ffb53e" />
          <circle cx="29" cy="20" r="4" fill="#42b8ff" />
          <circle cx="16" cy="29" r="4" fill="#8954ff" />
        </g>
      )}

      {/* Community heart */}
      {accessory === "heart" && (
        <path
          d="M157 46 C144 31 124 48 157 72 C190 48 170 31 157 46Z"
          fill="#ff83c6"
          stroke="#fff"
          strokeWidth="2"
        />
      )}

      <ellipse
        cx="120"
        cy="159"
        rx="28"
        ry="22"
        fill="#fff"
        opacity=".15"
      />
    </svg>
  );
}

export function InteractiveVideoShowcase() {
  const [active, setActive] = useState(2);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [paused, setPaused] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const didDrag = useRef(false);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const goTo = useCallback((index: number) => {
    const next = (index + features.length) % features.length;
    activeRef.current = next;
    setActive(next);
  }, []);

  const move = useCallback((direction: number) => {
    goTo(activeRef.current + direction);
  }, [goTo]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }

      if (event.key === "Escape") {
        setTilt({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || !stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    setTilt({ x: -y * 5, y: x * 7 });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = { x: event.clientX, y: event.clientY };
    didDrag.current = false;

    if (event.pointerType === "touch") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;

    const delta = event.clientX - dragStart.current.x;
    dragStart.current = null;

    if (Math.abs(delta) > 45) {
      didDrag.current = true;
      move(delta < 0 ? 1 : -1);
    }
  };

  const handleCardClick = (index: number) => {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }

    goTo(index);
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <section className="northstar-hero">
      <div className="hero-orb hero-orb--left" aria-hidden="true" />
      <div className="hero-orb hero-orb--right" aria-hidden="true" />
      <div className="hero-orb hero-orb--bottom" aria-hidden="true" />

      <header className="northstar-heading">
        <div className="workspace-pill">
          <Sparkles size={16} aria-hidden="true" />
          <span>One connected workspace</span>
        </div>

        <h1>
          A better way to{" "}
          <span className="gradient-text">learn, connect, and work.</span>
        </h1>

        <p>
          Explore how Northstar adapts to the people and teams who use it every day.
        </p>
      </header>

      <div
        className="carousel-shell"
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          resetTilt();
          dragStart.current = null;
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragStart.current = null;
          resetTilt();
        }}
        aria-label="Northstar features carousel"
      >
        <div
          className="carousel-stage"
          style={
            {
              "--tilt-x": `${tilt.x}deg`,
              "--tilt-y": `${tilt.y}deg`,
            } as CSSProperties
          }
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const offset =
              ((index - active + features.length + 2) % features.length) - 2;
            const distance = Math.abs(offset);
            const isActive = index === active;

            return (
              <button
                key={feature.title}
                type="button"
                className={[
                  "feature-card",
                  `feature-card--${feature.tone}`,
                  isActive ? "is-active" : "",
                ].join(" ")}
                style={
                  {
                    "--offset": offset,
                    "--distance": distance,
                    "--card-rotation": `${offset * -8}deg`,
                    "--card-delay": `${distance * 35}ms`,
                  } as CSSProperties
                }
                onClick={() => handleCardClick(index)}
                aria-pressed={isActive}
                aria-label={`Select ${feature.title}`}
                tabIndex={distance > 1 ? -1 : 0}
              >
                <div className="card-gloss" aria-hidden="true" />

                <div className="mascot-stage">
                  <div className="mascot-halo" aria-hidden="true" />
                  <div className="mascot-float">
                    <Teddy accessory={feature.accessory} />
                  </div>
                  <span className="mascot-sparkle mascot-sparkle--one" aria-hidden="true">
                    ✦
                  </span>
                  <span className="mascot-sparkle mascot-sparkle--two" aria-hidden="true">
                    ✧
                  </span>
                </div>

                <div className="card-copy">
                  <div className="card-icon">
                    <Icon size={23} strokeWidth={2.1} aria-hidden="true" />
                  </div>
                  <span className="card-tag">{feature.tag}</span>
                  <h2>{feature.title}</h2>
                  <p>{feature.description}</p>
                  <span className="card-open">
                    Explore <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <button
          className="carousel-arrow carousel-arrow--left"
          type="button"
          onClick={() => move(-1)}
          aria-label="Previous feature"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </button>

        <button
          className="carousel-arrow carousel-arrow--right"
          type="button"
          onClick={() => move(1)}
          aria-label="Next feature"
        >
          <ArrowRight size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="carousel-footer">
        <div className="interaction-hint">
          <Mouse size={17} aria-hidden="true" />
          <span>Drag or use arrow keys</span>
        </div>

        <div className="carousel-pagination" aria-label="Choose feature">
          {features.map((feature, index) => (
            <button
              type="button"
              key={feature.title}
              className={index === active ? "active" : ""}
              onClick={() => goTo(index)}
              aria-label={`Go to ${feature.title}`}
              aria-current={index === active ? "true" : undefined}
            />
          ))}
        </div>

        <button
          className="motion-toggle"
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
        >
          <Heart size={17} aria-hidden="true" />
          <span>{paused ? "Resume motion" : "Pause motion"}</span>
        </button>
      </div>

      <style>{paused ? `
        .northstar-hero .mascot-float,
        .northstar-hero .mascot-sparkle {
          animation-play-state: paused !important;
        }
      ` : ""}</style>
    </section>
  );
}


export default InteractiveVideoShowcase;