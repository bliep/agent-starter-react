'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface OverlayProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Modal panel over the call screen (summary, today's lesson). Closes on backdrop tap. */
export function Overlay({ title, onClose, children }: OverlayProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-16"
      onClick={onClose}
    >
      <section
        className="bg-background flex max-h-full w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-lg border p-6 text-base"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </header>
        {children}
      </section>
    </div>
  );
}
