// src/app/(auth)/login/page.tsx
import { LoginForm } from '@/features/auth/ui/LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}