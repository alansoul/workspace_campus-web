'use client';

import { useState, useEffect, useRef } from 'react';
import { CopilotMessage, ExampleStarter } from '../types/ai.types';
import {
  GraduationCap,
  Calendar,
  Briefcase,
  MessagesSquare,
} from 'lucide-react';

export function useCopilotOrchestrator() {
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [citationsEnabled, setCitationsEnabled] = useState(true);
  const [selectedModel, setSelectedModel] = useState('Campus Mind Orchestrator');
  const [activeNav, setActiveNav] = useState('chat');
  
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedThoughtId, setExpandedThoughtId] = useState<string | null>(null);

  // Entrance animation flags
  const [showShell, setShowShell] = useState(false);
  const [showOrb, setShowOrb] = useState(false);
  const [showHeading, setShowHeading] = useState(false);
  const [showInputBox, setShowInputBox] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tShell = setTimeout(() => setShowShell(true), 50);
    const tOrb = setTimeout(() => setShowOrb(true), 200);
    const tHeading = setTimeout(() => setShowHeading(true), 500);
    const tBox = setTimeout(() => setShowInputBox(true), 900);
    const tCards = setTimeout(() => setShowCards(true), 1300);

    return () => {
      clearTimeout(tShell);
      clearTimeout(tOrb);
      clearTimeout(tHeading);
      clearTimeout(tBox);
      clearTimeout(tCards);
    };
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (messages.length > 0) return;
    const fullText = 'Ask AI a question or query your campus schedule, attendance, and gigs...';
    let index = 0;
    const startTimer = setTimeout(() => {
      const typeInterval = setInterval(() => {
        index++;
        setTypedPlaceholder(fullText.slice(0, index));
        if (index >= fullText.length) {
          clearInterval(typeInterval);
        }
      }, 35);
      return () => clearInterval(typeInterval);
    }, 1100);
    return () => clearTimeout(startTimer);
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isProcessing) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    setExpandedThoughtId(assistantMsgId);

    const pendingMsg: CopilotMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentSteps: [
        { agentName: 'Triage Router', action: 'Parsing intent from prompt semantics...', status: 'running' },
        { agentName: 'Campus Data Agent', action: 'Retrieving records from institutional registry...', status: 'pending' },
        { agentName: 'Synthesizer', action: 'Composing structured answer with live citations...', status: 'pending' },
      ],
      citations: citationsEnabled ? ['IIIT-NR Academic Registry', 'Campus Cloud DB'] : [],
    };

    setMessages((prev) => [...prev, pendingMsg]);

    try {
      // Step 1
      await new Promise((r) => setTimeout(r, 600));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                agentSteps: m.agentSteps?.map((step, idx) =>
                  idx === 0
                    ? { ...step, status: 'completed', resultSnippet: 'Intent: Academic & Compliance Scope' }
                    : idx === 1
                    ? { ...step, status: 'running' }
                    : step
                ),
              }
            : m
        )
      );

      // Step 2
      await new Promise((r) => setTimeout(r, 800));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                agentSteps: m.agentSteps?.map((step, idx) =>
                  idx === 1
                    ? { ...step, status: 'completed', resultSnippet: 'Retrieved 82.4% avg attendance · Buffer: 2 lectures' }
                    : idx === 2
                    ? { ...step, status: 'running' }
                    : step
                ),
              }
            : m
        )
      );

      // Step 3
      await new Promise((r) => setTimeout(r, 700));
      const generatedAnswer =
        query.toLowerCase().includes('attendance') || query.toLowerCase().includes('class')
          ? `Based on your IIIT Naya Raipur Computer Science & Engineering (Semester 1) records, your aggregate statutory attendance currently stands at **82.4%** across all registered coursework.\n\n* **Safe Absence Buffer:** You have a buffer of **2 lecture sessions** in Data Structures & Discrete Mathematics before your overall standing drops near the **75.0% statutory threshold**.\n* **Next Class Action:** Your upcoming session is *Digital Logic Design Lab* at 10:30 AM in Lab 304.`
          : `I've routed your request through the Northstar Orchestrator. The relevant institutional modules have been inspected:\n\n* **Campus Mind Context:** No conflicting coursework or assignment deadlines detected for this timeframe.\n* **Recommendation:** You can track milestones directly inside your unified Academics or Freelance workspace modules.`;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: generatedAnswer,
                agentSteps: m.agentSteps?.map((step) => ({ ...step, status: 'completed' })),
                suggestedFollowUps: [
                  'View full semester timetable',
                  'Calculate attendance if I miss tomorrow',
                  'Check batch channel notices',
                ],
              }
            : m
        )
      );
    } catch {
      // Fallback on network error
    } finally {
      setIsProcessing(false);
    }
  };

  const exampleCards: ExampleStarter[] = [
    {
      title: 'Calculate my 75% attendance buffer in CSE',
      icon: GraduationCap,
      category: 'Academics',
    },
    {
      title: 'Where is my next lecture and lab scheduled today?',
      icon: Calendar,
      category: 'Timetable',
    },
    {
      title: 'Are there any open Flutter or Next.js campus bounties?',
      icon: Briefcase,
      category: 'Marketplace',
    },
    {
      title: 'Summarize announcements from the Batch of 2026',
      icon: MessagesSquare,
      category: 'Channels',
    },
  ];

  return {
    greeting,
    inputPrompt,
    setInputPrompt,
    typedPlaceholder,
    citationsEnabled,
    setCitationsEnabled,
    selectedModel,
    setSelectedModel,
    activeNav,
    setActiveNav,
    messages,
    isProcessing,
    expandedThoughtId,
    setExpandedThoughtId,
    showShell,
    showOrb,
    showHeading,
    showInputBox,
    showCards,
    messagesEndRef,
    handleSendMessage,
    exampleCards,
    resetThread: () => {
      setMessages([]);
      setInputPrompt('');
    },
  };
}