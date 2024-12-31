'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Here we'll implement analytics tracking
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    // TODO: Add proper analytics tracking
    console.log(`Page view: ${url}`);
  }, [pathname, searchParams]);

  return null;
} 