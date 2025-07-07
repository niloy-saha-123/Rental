"use client";

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isLendPage = pathname.startsWith('/lend');

  if (isLendPage) {
    return null;
  }

  return <Header />;
} 