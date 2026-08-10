import { Suspense } from 'react';
import SignUpContent from './SignUpContent';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <SignUpContent />
    </Suspense>
  );
}