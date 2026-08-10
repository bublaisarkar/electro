import { Suspense } from 'react';
import OrderPlacedContent from './OrderPlacedContent';

export default function OrderPlacedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <OrderPlacedContent />
    </Suspense>
  );
}