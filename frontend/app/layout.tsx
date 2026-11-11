import type { Metadata } from 'next';
import { Inter, Rubik } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { MetaPixel } from '@/components/analytics/MetaPixel';
import { ClientLoggerProvider } from '@/components/providers/ClientLoggerProvider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const rubik = Rubik({
  variable: '--font-rubik',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hype-resume.com'),
  title: 'HypeResume — AI Resume Builder & ATS Optimizer',
  description:
    'Build ATS-optimized resumes that land interviews. Match your experience to any job description, improve your bullets, and export clean PDFs. Trusted by thousands of job seekers.',
  keywords: ['resume builder', 'ATS resume', 'AI resume', 'job application', 'resume optimizer', 'resume checker'],
  openGraph: {
    title: 'HypeResume — AI Resume Builder & ATS Optimizer',
    description: 'Build ATS-optimized resumes that land interviews. Free resume checker & job matcher.',
    type: 'website',
    siteName: 'HypeResume',
    images: [{ url: '/logos/HypeResume-Full-Logo.png', width: 1200, height: 400, alt: 'HypeResume' }],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '';

  return (
    <html
      lang="en"
      className={`${inter.variable} ${rubik.variable} h-full`}
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
        {pixelId ? (
          <>
            {/* Meta Pixel Code */}
            <script
              id="fb-pixel"
              dangerouslySetInnerHTML={{
                __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
            {/* End Meta Pixel Code */}
          </>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 antialiased" style={{ fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <ClientLoggerProvider />
        <MetaPixel />
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<header className="fixed top-0 z-50 w-full h-16 bg-transparent" />}>
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
