import React from 'react';

export interface AgentStep {
  agentName: string;
  action: string;
  status: 'pending' | 'running' | 'completed';
  resultSnippet?: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentSteps?: AgentStep[];
  citations?: string[];
  suggestedFollowUps?: string[];
}

export interface ExampleStarter {
  title: string;
  description?: string;
  icon: React.ElementType;
  category: string;
}