// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/features/auth/hooks/useAuthSession';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: {
    default: 'Northstar Workspace',
    template: '%s | Northstar Workspace',
  },
  description: 'The all-in-one university workspace for students, faculty, and administrators.',
  applicationName: 'Northstar Workspace',
  keywords: ['university', 'campus', 'workspace', 'education', 'student portal'],
  authors: [{ name: 'Northstar Campus Team' }],
};

export const viewport: Viewport = {
  themeColor: '#1e293b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased bg-white text-slate-900">
        {/* Skip-to-content link for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-md focus:outline-none"
        >
          Skip to main content
        </a>
        {/* AuthProvider wraps the whole app so login, dashboard, and header can access session */}
        <AuthProvider>
          <main id="main-content">
            {children}
          </main>
          {/* 🔔 Clean Toast Notification Container */}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
