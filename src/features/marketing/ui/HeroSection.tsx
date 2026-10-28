'use client';


import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  Pause,
  GraduationCap,
  MessageSquare,
  FileText,
  Table2,
} from 'lucide-react';


export function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(true);


  const videoRef = useRef<HTMLVideoElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);


  // SVG circular perimeter: 2 * PI * 22 = ~138.23
  const circumference = 138.23;


  // Ultra-smooth 60/120fps hardware loop directly driving the SVG stroke
  useEffect(() => {
    let rafId: number;


    function renderLoop() {
      const video = videoRef.current;
      const circle = circleRef.current;


      if (video && circle && !video.paused && video.duration > 0) {
        const progress = video.currentTime / video.duration;
        const offset = circumference * (1 - progress);
        circle.style.strokeDashoffset = `${offset}`;
      }


      if (isPlaying) {
        rafId = requestAnimationFrame(renderLoop);
      }
    }


    if (isPlaying) {
      rafId = requestAnimationFrame(renderLoop);
    }


    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isPlaying, circumference]);


  // Handle Play/Pause toggle
  function togglePlayPause() {
    const video = videoRef.current;
    if (!video) return;


    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }


  return (
    <section className="relative isolate pt-8 lg:pt-12 pb-20 sm:pb-24 overflow-visible select-none bg-transparent">
      {/* Soft ambient glows stay inside this section's stacking context. */}
      <div className="absolute top-10 right-1/4 z-0 h-120 w-160 rounded-full bg-[#E8F0FE]/45 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 z-0 h-96 w-96 rounded-full bg-[#F3E8FD]/40 blur-3xl pointer-events-none" />


      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Google Typography & Action Button            */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-7 text-left z-10">
          <div className="space-y-5">
            <h1 className="font-['Google_Sans',sans-serif] text-[52px] sm:text-[68px] lg:text-[76px] font-semibold tracking-[-0.03em] text-[#1F1F1F] leading-[1.05]">
              The better <br />
              way to work
            </h1>


            <p className="font-['Google_Sans',sans-serif] text-[17px] sm:text-[18px] text-[#444746] font-normal leading-[1.55] max-w-xl">
              Join universities, students, and teams that run on premium versions of Campus, Circle, Workflow, and more. Focus on getting results instead of looking for information with helpful, personalised AI.
            </p>
          </div>


          <div className="pt-1">
            <Link
              href="/setup"
              className="font-['Google_Sans',sans-serif] inline-flex justify-center items-center bg-[#0B57D0] hover:bg-[#0842A0] text-white text-[15px] font-medium px-8 py-3.5 rounded-full transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
            >
              Start Free Trial
            </Link>
          </div>
        </div>


        {/* ========================================================= */}
        {/* RIGHT COLUMN: Video Nudged to the Right (Opposite Side)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 relative flex justify-center lg:justify-end items-center pt-6 lg:pt-0 lg:translate-x-4 xl:translate-x-8 transition-transform duration-200">
          {/* ORBITING SATELLITE BADGES */}
          {/* Top-Right Gemini Sparkle Badge */}
          <div className="absolute -top-3 right-8 sm:right-14 z-30 w-11 h-11 rounded-full bg-[#1A73E8] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(26,115,232,0.35)] transition-transform hover:scale-105">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>


          {/* Top Collaborator Pill */}
          <div className="absolute -top-5 left-1/4 sm:left-1/3 z-20 hidden sm:flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-[#E0E2E7] shadow-sm">
            <div className="w-5 h-5 rounded-full bg-[#EA4335] text-white flex items-center justify-center text-[10px] font-bold">
              R
            </div>
            <span className="text-[11px] font-medium text-[#444746]">Rohan B.</span>
          </div>


          {/* Left Satellite: Campus */}
          <div className="absolute top-10 -left-3 sm:-left-5 z-30 w-11 h-11 rounded-2xl bg-white border border-[#E0E2E7] flex items-center justify-center shadow-lg transition-transform hover:scale-105">
            <GraduationCap className="w-5 h-5 text-[#1A73E8]" />
          </div>


          {/* Left Satellite: Circle */}
          <div className="absolute top-32 -left-2 sm:-left-4 z-30 w-10 h-10 rounded-full bg-[#34A853] text-white flex items-center justify-center shadow-[0_8px_18px_rgba(52,168,83,0.3)] transition-transform hover:scale-105">
            <MessageSquare className="w-4 h-4 fill-white" />
          </div>


          {/* Collaborator Avatars */}
          <div className="absolute bottom-24 -left-2 z-20 w-8 h-8 rounded-full ring-2 ring-white shadow-md bg-[#7C4DFF] text-white flex items-center justify-center text-[11px] font-bold">
            A
          </div>
          <div className="absolute -top-2 -right-1 z-20 w-8 h-8 rounded-full ring-2 ring-white shadow-md bg-[#FBBC04] text-[#1F1F1F] flex items-center justify-center text-[11px] font-bold">
            S
          </div>


          {/* ---------------- MAIN VIDEO CONTAINER ---------------- */}
          <div className="w-full max-w-155 rounded-3xl overflow-hidden border border-[#DADCE0] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.03)] relative">
            <video
              ref={videoRef}
              src="/videos/hero-demo.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-auto block object-cover"
            />
          </div>


          {/* ---------------- LOWER ANCHORED DOC CARDS ---------------- */}
          <div className="absolute -bottom-10 sm:-bottom-12 left-4 sm:left-8 z-30 flex items-center gap-2.5 sm:gap-3 pointer-events-none">
            {/* Notes Doc Preview */}
            <div className="bg-white/95 backdrop-blur-md border border-[#E0E2E7] rounded-xl p-2.5 shadow-xl flex items-center gap-2.5 hover:-translate-y-0.5 transition-transform pointer-events-auto">
              <div className="w-7.5 h-7.5 rounded-lg bg-[#E8F0FE] flex items-center justify-center text-[#1A73E8]">
                <FileText className="w-4 h-4" />
              </div>
              <div className="pr-1.5">
                <p className="text-[11px] font-semibold text-[#1F1F1F] leading-tight">Consensus-Unit4.docx</p>
                <p className="text-[9.5px] text-[#5F6368]">Synced with Gemini</p>
              </div>
            </div>


            {/* Escrow Sheet Preview */}
            <div className="bg-white/95 backdrop-blur-md border border-[#E0E2E7] rounded-xl p-2.5 shadow-xl flex items-center gap-2.5 hover:-translate-y-0.5 transition-transform pointer-events-auto">
              <div className="w-7.5 h-7.5 rounded-lg bg-[#E6F4EA] flex items-center justify-center text-[#137333]">
                <Table2 className="w-4 h-4" />
              </div>
              <div className="pr-1.5">
                <p className="text-[11px] font-semibold text-[#1F1F1F] leading-tight">Milestone-Escrow.sheet</p>
                <p className="text-[9.5px] text-[#5F6368]">₹8,500 locked</p>
              </div>
            </div>
          </div>
          


          {/* ---------------- GOOGLE CIRCULAR PLAY BUTTON ---------------- */}
          <div className="absolute -bottom-10 sm:-bottom-12 right-2 sm:right-6 z-40">
            <button
              onClick={togglePlayPause}
              className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-[#E8EAED]"
              title={isPlaying ? 'Pause preview' : 'Play preview'}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {/* Outer SVG Track & 60/120fps Synchronized Progress Circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-0.5" viewBox="0 0 48 48">
                {/* Background Ring */}
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  className="stroke-[#E8EAED] stroke-[2.5] fill-none"
                />
                {/* Animated Blue Ring directly controlled via requestAnimationFrame */}
                <circle
                  ref={circleRef}
                  cx="24"
                  cy="24"
                  r="22"
                  className="stroke-[#1A73E8] stroke-[2.5] fill-none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  strokeLinecap="round"
                />
              </svg>


              {isPlaying ? (
                <Pause className="w-4 h-4 text-[#1A73E8] fill-[#1A73E8]" />
              ) : (
                <Play className="w-4 h-4 text-[#1A73E8] fill-[#1A73E8] ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}