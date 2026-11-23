'use client';

import React, { useId, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Headphones,
  Lock,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const TOPICS = [
  { value: 'billing', label: 'Billing & payments' },
  { value: 'technical', label: 'Technical issue' },
  { value: 'account', label: 'Account & access' },
  { value: 'product', label: 'Product / feature help' },
  { value: 'partnership', label: 'Partnerships' },
  { value: 'other', label: 'Something else' },
] as const;

const FAQS = [
  {
    q: 'How fast do you reply?',
    a: 'We monitor support@hype-resume.com continuously. Most messages receive a human reply within a few hours; complex billing or account recovery cases may take up to one business day.',
  },
  {
    q: 'I paid but Pro did not unlock — what should I do?',
    a: 'Include your account email and approximate payment time in the form (topic: Billing). We will verify the Dodo receipt and restore Pro access immediately if the charge succeeded.',
  },
  {
    q: 'Can I get a refund?',
    a: 'One-time Pro passes are refundable when unused AI tooling was consumed and you request within 7 days. Mention your order details and we will review quickly.',
  },
  {
    q: 'Is my resume data private?',
    a: 'Yes. We do not train models on your resumes. Details live on our Privacy and Security pages — your career data stays yours.',
  },
];

type TopicValue = (typeof TOPICS)[number]['value'];

export function ContactSupportClient() {
  const formId = useId();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<TopicValue>('technical');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiClient.submitContactMessage({
        fullName: fullName.trim(),
        email: email.trim(),
        topic,
        subject: subject.trim(),
        message: message.trim(),
        website: website.trim() || undefined,
      });
      setDone(true);
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTopic('technical');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send your message. Please email support@hype-resume.com directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[70vh] overflow-hidden bg-[#f4f7fb] text-slate-900">
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(56,114,250,0.18), transparent 60%), linear-gradient(180deg, #e8eef8 0%, #f4f7fb 55%, #f4f7fb 100%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(56,114,250,0.25), transparent 70%)' }}
        aria-hidden
      />

      <div
        className={`relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8 transition-all duration-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        {/* Hero — brand first, one job */}
        <header className="max-w-2xl">
          <p className="font-rubik text-sm font-semibold tracking-wide text-[#3872FA]">HypeResume Support</p>
          <h1 className="mt-3 font-rubik text-[2.15rem] font-semibold leading-[1.12] tracking-tight text-slate-950 sm:text-5xl">
            Real people. Real replies.
            <span className="block text-slate-600">We&apos;re here when your search can&apos;t wait.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Billing questions, Pro unlocks, exports, or product help — write us anytime.
            Our team monitors email around the clock so you are never stuck mid-application.
          </p>
        </header>

        {/* Trust strip — not a card grid of fluff */}
        <div
          className={`mt-10 flex flex-col gap-4 border-y border-slate-200/80 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-10 sm:gap-y-3 transition-all delay-150 duration-700 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <Headphones className="h-4 w-4 shrink-0 text-[#3872FA]" />
            <span>
              <strong className="font-semibold text-slate-900">24×7 email monitoring</strong>
              {' '}at support@hype-resume.com
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <Clock3 className="h-4 w-4 shrink-0 text-[#3872FA]" />
            <span>
              Typical reply <strong className="font-semibold text-slate-900">under 12 hours</strong>
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#3872FA]" />
            <span>Human support — no ticket black holes</span>
          </div>
        </div>

        {/* Main composition: form + side help */}
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* Form interaction surface */}
          <section
            aria-labelledby={`${formId}-title`}
            className={`relative rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8 transition-all delay-200 duration-700 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            }`}
          >
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3872FA]/10 text-[#3872FA]">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <div>
                <h2 id={`${formId}-title`} className="font-rubik text-xl font-semibold tracking-tight text-slate-900">
                  Send a message
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  We route every request to a real teammate. You&apos;ll get a confirmation email right away.
                </p>
              </div>
            </div>

            {done ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-5 py-8 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <h3 className="mt-3 font-rubik text-lg font-semibold text-emerald-950">Message received</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-900/80">
                  Thanks — our support queue has it. Watch your inbox for a reply from{' '}
                  <span className="font-medium">support@hype-resume.com</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setDone(false)}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3872FA] hover:underline"
                >
                  Send another message
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Honeypot */}
                <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden>
                  <label htmlFor={`${formId}-website`}>Website</label>
                  <input
                    id={`${formId}-website`}
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-[12px] font-semibold text-slate-700">Full name</span>
                    <input
                      required
                      minLength={2}
                      maxLength={120}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#3872FA] focus:ring-2 focus:ring-[#3872FA]/20"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[12px] font-semibold text-slate-700">Email</span>
                    <input
                      required
                      type="email"
                      maxLength={255}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#3872FA] focus:ring-2 focus:ring-[#3872FA]/20"
                      placeholder="you@company.com"
                      autoComplete="email"
                    />
                  </label>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-[12px] font-semibold text-slate-700">Topic</span>
                  <select
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as TopicValue)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#3872FA] focus:ring-2 focus:ring-[#3872FA]/20"
                  >
                    {TOPICS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[12px] font-semibold text-slate-700">Subject</span>
                  <input
                    required
                    minLength={4}
                    maxLength={200}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#3872FA] focus:ring-2 focus:ring-[#3872FA]/20"
                    placeholder="Short summary of how we can help"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[12px] font-semibold text-slate-700">Message</span>
                  <textarea
                    required
                    minLength={20}
                    maxLength={4000}
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-[#3872FA] focus:ring-2 focus:ring-[#3872FA]/20"
                    placeholder="Include account email, what you tried, and any order or resume IDs if relevant."
                  />
                  <span className="text-[11px] text-slate-400">{message.length}/4000</span>
                </label>

                {error && (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3872FA] text-sm font-semibold text-white shadow-[0_12px_28px_-8px_rgba(56,114,250,0.55)] transition hover:bg-[#2f62e0] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
                >
                  {submitting ? (
                    'Sending…'
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Send to support
                    </>
                  )}
                </button>

                <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-slate-500">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Your message is encrypted in transit and only visible to HypeResume administrators.
                </p>
              </form>
            )}
          </section>

          {/* Side column — direct channels + FAQ */}
          <aside
            className={`space-y-10 transition-all delay-300 duration-700 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            }`}
          >
            <div>
              <h2 className="font-rubik text-lg font-semibold tracking-tight text-slate-900">
                Prefer email directly?
              </h2>
              <a
                href="mailto:support@hype-resume.com"
                className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 transition hover:border-[#3872FA]/40 hover:bg-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Mail className="h-4.5 w-4.5 h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">support@hype-resume.com</span>
                  <span className="block text-xs text-slate-500">Monitored 24×7 · Prefer this for urgent Pro unlocks</span>
                </span>
              </a>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                For the fastest billing help, include the email on your HypeResume account and the payment timestamp.
              </p>
            </div>

            <div>
              <h2 className="font-rubik text-lg font-semibold tracking-tight text-slate-900">
                Quick answers
              </h2>
              <ul className="mt-4 divide-y divide-slate-200/90 border-y border-slate-200/90">
                {FAQS.map((item, idx) => {
                  const open = openFaq === idx;
                  return (
                    <li key={item.q}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? null : idx)}
                        className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
                        aria-expanded={open}
                      >
                        <span className="text-sm font-medium text-slate-800">{item.q}</span>
                        <span
                          className={`text-lg leading-none text-slate-400 transition ${open ? 'rotate-45' : ''}`}
                          aria-hidden
                        >
                          +
                        </span>
                      </button>
                      {open && (
                        <p className="pb-3.5 text-sm leading-relaxed text-slate-600">{item.a}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-medium text-slate-800">Also useful</p>
              <Link href="/security" className="block text-[#3872FA] hover:underline">
                Security &amp; trust →
              </Link>
              <Link href="/privacy" className="block text-[#3872FA] hover:underline">
                Privacy policy →
              </Link>
              <Link href="/pricing" className="block text-[#3872FA] hover:underline">
                Pricing &amp; plans →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
