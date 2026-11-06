'use client';

import { useState, useEffect, useRef } from 'react';
import { CopilotMessage, ExampleStarter } from '../types/copilot.types';
import { copilotService } from '../services/copilot.service';
import {
  GraduationCap,
  Calendar,
  Briefcase,
  MessagesSquare,
} from 'lucide-react';

export function useCopilotOrchestrator() {
  const [greeting] = useState<string>(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [typedPlaceholder, setTypedPlaceholder] = useState<string>('');
  const [citationsEnabled, setCitationsEnabled] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<string>('Campus Mind Orchestrator');
  const [activeNav, setActiveNav] = useState<string>('chat');

  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [expandedThoughtId, setExpandedThoughtId] = useState<string | null>(null);

  // Entrance animation flags
  const [showShell, setShowShell] = useState<boolean>(false);
  const [showOrb, setShowOrb] = useState<boolean>(false);
  const [showHeading, setShowHeading] = useState<boolean>(false);
  const [showInputBox, setShowInputBox] = useState<boolean>(false);
  const [showCards, setShowCards] = useState<boolean>(false);

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
        { agentName: 'Triage Router', action: 'Parsing intent and campus scope...', status: 'running' },
        { agentName: 'Campus Synthesizer', action: 'Streaming LLM completion...', status: 'pending' },
      ],
      citations: citationsEnabled ? ['IIIT-NR Academic Registry'] : [],
    };

    setMessages((prev) => [...prev, pendingMsg]);

    try {
      const result = await copilotService.queryOrchestrator(query, {
        citations: citationsEnabled,
        model: selectedModel,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: result.content || 'Response generated.',
                agentSteps: result.agentSteps || [],
                citations: result.citations || [],
                suggestedFollowUps: result.suggestedFollowUps || [],
              }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: 'Failed to communicate with the AI engine. Please verify your connection or model settings.',
                agentSteps: [{ agentName: 'Orchestrator', action: 'Engine communication error', status: 'completed' }],
              }
            : m
        )
      );
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