import { ModernAuthCard } from '@/features/auth/ui/ModernAuthCard';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ModernAuthCard initialMode="signup" />
    </Suspense>
  );
}