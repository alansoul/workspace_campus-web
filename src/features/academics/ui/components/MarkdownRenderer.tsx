'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-[#18181b] shadow-md font-mono text-[11px]">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#27272a] border-b border-slate-700/50 text-slate-300">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md hover:bg-slate-600/50 text-slate-300 hover:text-white transition cursor-pointer"
        >
          {copied ? '✓ Copied!' : '📋 Copy code'}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-slate-200 leading-relaxed font-mono">
        <code>{children}</code>
      </div>
    </div>
  );
}

interface CodeComponentProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  node?: unknown;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-xs max-w-none text-slate-800 leading-relaxed wrap-break-word">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }: CodeComponentProps) {
            if (!inline) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }
            return (
              <code
                className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px] font-semibold border border-indigo-100"
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-2.5 last:mb-0 leading-normal">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-4 mb-2.5 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-4 mb-2.5 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-snug">{children}</li>;
          },
          strong({ children }) {
            return <strong className="font-bold text-slate-900">{children}</strong>;
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                {children}
              </thead>
            );
          },
          th({ children }) {
            return <th className="p-2 border-r last:border-r-0 border-slate-200">{children}</th>;
          },
          td({ children }) {
            return <td className="p-2 border-t border-r last:border-r-0 border-slate-200 text-slate-600">{children}</td>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-3 border-indigo-500 pl-3 my-2 text-slate-600 italic">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}