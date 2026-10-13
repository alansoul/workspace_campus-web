// src/app/layout.tsx
import './globals.css';
import { AuthProvider } from '@/features/auth/hooks/useAuthSession';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Northstar Workspace',
  description: 'The all-in-one university workspace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-900">
        {/* AuthProvider wraps the whole app so login, dashboard, and header can access session */}
        <AuthProvider>
          {children}
          {/* 🔔 Clean Toast Notification Container */}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}