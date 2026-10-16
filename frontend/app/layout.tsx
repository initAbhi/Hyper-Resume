import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HyperResume — AI Resume Builder & ATS Optimizer',
  description:
    'Build ATS-optimized resumes that land interviews. Match your experience to any job description, improve your bullets, and export clean PDFs. Trusted by thousands of job seekers.',
  keywords: ['resume builder', 'ATS resume', 'AI resume', 'job application', 'resume optimizer', 'resume checker'],
  openGraph: {
    title: 'HyperResume — AI Resume Builder & ATS Optimizer',
    description: 'Build ATS-optimized resumes that land interviews. Free resume checker & job matcher.',
    type: 'website',
    siteName: 'HyperResume',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var t = localStorage.getItem('hyperresume-theme');
                if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch(e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 antialiased" style={{ fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<header className="sticky top-0 z-50 w-full h-16 border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1 flex flex-col">{children}</main>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
