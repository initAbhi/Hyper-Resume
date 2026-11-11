import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function PublicResumeShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

