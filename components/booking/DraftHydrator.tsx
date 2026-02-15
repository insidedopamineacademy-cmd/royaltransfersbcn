'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBooking } from '@/lib/booking/context';
import type { DraftInput } from '@/lib/booking/context';

export default function DraftHydrator() {
  const { hydrateFromDraft, goToStep } = useBooking();
  const searchParams = useSearchParams();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const raw = sessionStorage.getItem('booking-draft');
    if (!raw) return;

    try {
      const draft: unknown = JSON.parse(raw);

      // 1) Hydrate context (supports v2 + legacy)
      hydrateFromDraft(draft as  DraftInput);

      // 2) Go to requested step (step=2 => Vehicle Selection => index 1)
      const stepParam = Number(searchParams.get('step') || '1');
      const targetWizardIndex = Math.max(0, stepParam - 1);
      goToStep(targetWizardIndex);

      // 3) Clear draft so refresh doesn't re-apply
      sessionStorage.removeItem('booking-draft');
    } catch {
      sessionStorage.removeItem('booking-draft');
    }
  }, [hydrateFromDraft, goToStep, searchParams]);

  return null;
}