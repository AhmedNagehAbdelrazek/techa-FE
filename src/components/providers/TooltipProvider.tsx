'use client';

import { TooltipProvider as RadixTooltipProvider } from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

interface TooltipProviderProps {
  children: ReactNode;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return (
    <RadixTooltipProvider delayDuration={0}>
      {children}
    </RadixTooltipProvider>
  );
}
