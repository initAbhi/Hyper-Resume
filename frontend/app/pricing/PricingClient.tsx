'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';

import {
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  CreditCard,
  CheckCircle2,
  X,
  Sparkles,
  Lock,
} from 'lucide-react';

import { apiClient, PricingPlan, PaymentOrderResponse } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { analytics } from '@/lib/analytics';

const FALLBACK_PLANS: PricingPlan[] = [
  {
    id: 'free_tier',
    name: 'Free Starter',
    tagline: 'Explore truthful AI career optimization without upfront cost',
    amountMinor: 0,
    currency: 'INR',
    displayPrice: '₹0',
    credits: 5,
    billingType: 'one_time',
    features: [
      '5 Welcome AI Optimization Credits',
      'Full ATS single-column document editor',
      'Grounded job description matcher',
      'Clean PDF Export with zero watermarks',
      'Zero model training privacy protection',
    ],
  },
  {
    id: 'job_hunt_pack',
    name: 'Job Hunt Pack',
    tagline: 'Ideal for targeted applications to specific dream companies',
    amountMinor: 39900,
    currency: 'INR',
    displayPrice: '₹399',
    credits: 30,
    billingType: 'one_time',
    badge: 'Most Popular',
    features: [
      '30 AI Optimization Credits (~15 full job matches)',
      'Grounded STAR / XYZ bullet rewrites',
      'Evidence quote citations & missing keyword radar',
      'Create separate tailored resume variants',
      'Never expires · One-time purchase',
    ],
  },
  {
    id: 'job_hunt_pro',
    name: 'Job Hunt Pro',
    tagline: 'Maximum power for competitive career transitions and senior roles',
    amountMinor: 89900,
    currency: 'INR',
    displayPrice: '₹899',
    credits: 100,
    billingType: 'one_time',
    badge: 'Best Value',
    features: [
      '100 AI Optimization Credits (~50 full job matches)',
      'Deep structural ATS compliance audits',
      'Unlimited tailored variants & snapshot versions',
      'Full application pipeline tracking',
      'Complete career data portability (JSON export)',
      'Priority email support',
    ],
  },
];

const FAQS = [
  {
    q: 'How do credits work and what does each action cost?',
    a: 'Credits provide access to compute-intensive AI operations. A single bullet rewrite costs 1 credit. A complete job description gap analysis with evidence citation costs 2 credits. Standard operations like editing, autosaving, reordering sections, and exporting clean PDFs are completely free and never consume credits.',
  },
  {
    q: 'Are there hidden recurring subscriptions or automatic renewals?',
    a: 'Absolutely not. We believe forced subscriptions during a vulnerable job hunt are predatory. Our Job Hunt Pack and Job Hunt Pro plans are one-time payments. You pay once, receive your credits, and use them whenever you need. There are no recurring fees or automatic rebilling.',
  },
  {
    q: 'What happens if an AI rewrite or job match request fails?',
    a: 'Our server-side entitlement ledger is strictly transactional and idempotent. If an AI service experiences a timeout, rate limit, or network disconnection, our system automatically rolls back the transaction and refunds the reserved credits immediately.',
  },
  {
    q: 'Can I export my resume without paying?',
    a: 'Yes! Unlike dishonest resume builders that let you type for an hour before asking for ₹1,999 to download your PDF, HyperResume allows unlimited, clean, watermark-free PDF exports on every tier, including Free Starter.',
  },
  {
    q: 'Do purchased credits expire if I get hired quickly?',
    a: 'No. Purchased credits never expire. If you land an offer soon, any remaining credits remain securely tied to your account ready for your next promotion or career move years down the line.',
  },
  {
    q: 'Are my resumes or personal information used to train AI models?',
    a: 'Never. We enforce a strict zero-training privacy policy. Your resume contents, career history, and job descriptions are processed ephemerally with enterprise zero-retention agreements and are never used to train public or proprietary foundation models.',
  },
];

export function PricingClient() {
  const router = useRouter();
  const { user, creditBalance, isAuthenticated, refreshUser } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>(FALLBACK_PLANS);
  const [activePlan, setActivePlan] = useState<PricingPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'processing' | 'success' | 'error'>('review');
  const [orderData, setOrderData] = useState<PaymentOrderResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successReceipt, setSuccessReceipt] = useState<{
    orderId: string;
    paymentId: string;
    creditsAwarded: number;
    newBalance: number;
  } | null>(null);

  useEffect(() => {
    analytics.track('pricing_viewed', { source: 'pricing_page' });

    apiClient
      .getPricingPlans()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
        }
      })
      .catch(() => {
        // Fall back to predefined catalog
      });
  }, []);

  const handleSelectPlan = (plan: PricingPlan) => {
    if (plan.amountMinor === 0) {
      if (isAuthenticated) {
        router.push('/app');
      } else {
        router.push('/register');
      }
      return;
    }

    if (!isAuthenticated) {
      router.push(`/register?redirect=/pricing&plan=${plan.id}`);
      return;
    }

    setActivePlan(plan);
    setCheckoutStep('review');
    setErrorMessage('');
    setOrderData(null);
    setIsCheckoutOpen(true);
    analytics.track('checkout_started', {
      planId: plan.id,
      amount: plan.amountMinor,
      credits: plan.credits,
    });
  };

  const handleInitiateOrder = async () => {
    if (!activePlan) return;
    setCheckoutStep('processing');
    setErrorMessage('');

    try {
      const order = await apiClient.createPaymentOrder({
        planId: activePlan.id,
      });
      setOrderData(order);
    } catch (err: unknown) {
      setCheckoutStep('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unable to create checkout order. Please try again.');
    }
  };

  const handleSimulatePayment = async () => {
    if (!orderData || !activePlan) return;
    setCheckoutStep('processing');
    setErrorMessage('');

    try {
      const providerPaymentId = `pay_sandbox_${Date.now()}`;
      const result = await apiClient.verifyPayment({
        orderId: orderData.orderId,
        providerPaymentId,
      });

      if (result.verified) {
        await refreshUser();
        analytics.track('purchase_completed', {
          planId: activePlan.id,
          amount: activePlan.amountMinor,
          credits: activePlan.credits,
          paymentId: result.paymentId,
        });

        setSuccessReceipt({
          orderId: orderData.orderId,
          paymentId: result.paymentId,
          creditsAwarded: activePlan.credits,
          newBalance: result.balance,
        });
        setCheckoutStep('success');
      } else {
        setCheckoutStep('error');
        setErrorMessage('Payment verification failed. Please contact support.');
      }
    } catch (err: unknown) {
      setCheckoutStep('error');
      setErrorMessage(err instanceof Error ? err.message : 'Payment verification failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="info" className="mb-3 px-3 py-1 font-semibold text-xs">
          Honest Indian Career Tech
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pay Only For Real Results. <br className="hidden sm:inline" />
          No Deceptive Paywalls.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
          Zero surprise rebills. No locked downloads. Start with free welcome credits and upgrade only when you need intensive application tailoring.
        </p>

        {isAuthenticated && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>
              Signed in as <strong>{user?.email}</strong> · Current Balance: <strong>{creditBalance} Credits</strong>
            </span>
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
        {plans.map((plan) => {
          const isHighlighted = plan.id === 'job_hunt_pack';
          const isFree = plan.amountMinor === 0;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between transition-all duration-200 ${
                isHighlighted
                  ? 'border-2 border-blue-600 dark:border-blue-500 shadow-xl relative scale-102 bg-white dark:bg-zinc-900 ring-4 ring-blue-600/10'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60'
              }`}
            >
              <div>
                <CardHeader className="pb-4">
                  {plan.badge && (
                    <Badge variant="info" className="w-fit mb-2 text-xs font-semibold">
                      {plan.badge}
                    </Badge>
                  )}
                  <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
                      {plan.displayPrice}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium ml-1">
                      {isFree ? '/forever free' : '/one-time purchase'}
                    </span>
                  </div>
                  <CardDescription className="text-xs mt-2 leading-relaxed min-h-[38px]">
                    {plan.tagline}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="p-3 mb-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Included Credits
                      </span>
                    </div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {plan.credits} Credits
                    </span>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Entitlements
                    </span>
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-6">
                <Button
                  variant={isHighlighted ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full justify-center font-medium shadow-sm"
                >
                  {isFree ? (
                    isAuthenticated ? 'Go to Resumes' : 'Start for Free'
                  ) : (
                    <>
                      <span>Get {plan.name}</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="mb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Compare Feature Entitlements
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Exact capabilities unlocked on each tier without ambiguity.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Capability</th>
                <th className="py-3.5 px-4 font-semibold text-center">Free Starter</th>
                <th className="py-3.5 px-4 font-semibold text-center text-blue-600 dark:text-blue-400">
                  Job Hunt Pack (₹399)
                </th>
                <th className="py-3.5 px-4 font-semibold text-center">Job Hunt Pro (₹899)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-300">
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  AI Optimization Credits
                </td>
                <td className="py-3 px-4 text-center">5 Credits</td>
                <td className="py-3 px-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                  30 Credits
                </td>
                <td className="py-3 px-4 text-center font-semibold">100 Credits</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  ATS Single-Column Editor
                </td>
                <td className="py-3 px-4 text-center text-emerald-600 font-medium">Included</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-medium">Included</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-medium">Included</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Grounded STAR Bullet Rewrites
                </td>
                <td className="py-3 px-4 text-center">5 rewrites</td>
                <td className="py-3 px-4 text-center text-blue-600 font-medium">30 rewrites</td>
                <td className="py-3 px-4 text-center font-medium">100 rewrites</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Job Description Gap Analysis
                </td>
                <td className="py-3 px-4 text-center">Basic match (1)</td>
                <td className="py-3 px-4 text-center text-blue-600 font-medium">
                  Detailed gap analysis (~15)
                </td>
                <td className="py-3 px-4 text-center font-medium">Deep structural audits (~50)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Tailored Resume Variants
                </td>
                <td className="py-3 px-4 text-center">1 Master</td>
                <td className="py-3 px-4 text-center text-blue-600 font-medium">5 Variants</td>
                <td className="py-3 px-4 text-center font-medium">Unlimited Variants</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Clean PDF Downloads
                </td>
                <td className="py-3 px-4 text-center text-emerald-600 font-medium">
                  100% Free & No Watermark
                </td>
                <td className="py-3 px-4 text-center text-emerald-600 font-medium">
                  100% Free & No Watermark
                </td>
                <td className="py-3 px-4 text-center text-emerald-600 font-medium">
                  100% Free & No Watermark
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Recurring Auto-Billing
                </td>
                <td className="py-3 px-4 text-center text-zinc-400">None</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-semibold">
                  None (Pay Once)
                </td>
                <td className="py-3 px-4 text-center text-emerald-600 font-semibold">
                  None (Pay Once)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Guarantee Card */}
      <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-center max-w-3xl mx-auto flex flex-col items-center gap-3 mb-20 shadow-sm">
        <ShieldCheck className="w-9 h-9 text-emerald-600 dark:text-emerald-500" />
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Our Fair Pricing & Privacy Guarantee
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          We strictly reject fake discount countdowns, phantom scarcity tickers, and hidden subscriptions. If an AI job fails, your credits are refunded to your ledger immediately. Your resume documents and master profile remain yours forever.
        </p>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs"
            >
              <h4 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 mb-2">
                {faq.q}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Modal Dialog */}
      {isCheckoutOpen && activePlan && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 overflow-hidden">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step: Review & Initiate */}
            {checkoutStep === 'review' && !orderData && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    Order Summary
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 mb-5 space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <span>{activePlan.name}</span>
                    <span className="text-base text-blue-600 dark:text-blue-400">
                      {activePlan.displayPrice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <span>Included AI Credits:</span>
                    <span className="font-semibold text-emerald-600">+{activePlan.credits} Credits</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <span>Billing Type:</span>
                    <span>One-time (Never rebills)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-6">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>256-bit encrypted secure checkout. Safe payment guarantee.</span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  onClick={handleInitiateOrder}
                >
                  Proceed to Secure Checkout
                </Button>
              </div>
            )}

            {/* Step: Order Created (Sandbox or Provider Action) */}
            {checkoutStep === 'review' && orderData && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    Complete Test Purchase
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 mb-5 space-y-2">
                  <div className="flex justify-between items-center text-xs text-zinc-600 dark:text-zinc-300">
                    <span>Environment:</span>
                    <Badge variant="info" className="text-[10px] font-mono">
                      {orderData.provider.toUpperCase()} MODE
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-600 dark:text-zinc-300">
                    <span>Order Reference:</span>
                    <span className="font-mono text-[11px] font-semibold">{orderData.orderId.slice(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-1 border-t border-blue-200/40">
                    <span>Total Payable:</span>
                    <span>{activePlan.displayPrice}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 mb-5 leading-relaxed">
                  Development mode is active. Click below to verify the server-side order and award{' '}
                  <strong>{activePlan.credits} credits</strong> to your balance immediately.
                </p>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  onClick={handleSimulatePayment}
                >
                  Confirm Test Payment (Instant)
                </Button>
              </div>
            )}

            {/* Step: Processing */}
            {checkoutStep === 'processing' && (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  Verifying with Payment Provider...
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Connecting to server-side credit ledger. Do not close this window.
                </p>
              </div>
            )}

            {/* Step: Success Receipt */}
            {checkoutStep === 'success' && successReceipt && (
              <div className="py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-center text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                  Payment Confirmed!
                </h3>
                <p className="text-center text-xs text-zinc-500 mb-6">
                  {successReceipt.creditsAwarded} credits have been deposited to your account.
                </p>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Transaction ID:</span>
                    <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                      {successReceipt.paymentId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Credits Credited:</span>
                    <span className="font-bold text-emerald-600">+{successReceipt.creditsAwarded}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700">
                    <span className="text-zinc-500">New Total Balance:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {successReceipt.newBalance} Credits
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1 justify-center"
                    onClick={() => setIsCheckoutOpen(false)}
                  >
                    Close
                  </Button>
                  <Link href="/app/resumes" className="flex-1">
                    <Button variant="primary" size="md" className="w-full justify-center">
                      Optimize Resume
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Step: Error */}
            {checkoutStep === 'error' && (
              <div className="py-2">
                <Alert variant="destructive" title="Checkout Notice" className="mb-5">
                  {errorMessage}
                </Alert>

                <div className="flex gap-3">

                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1 justify-center"
                    onClick={() => setIsCheckoutOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1 justify-center"
                    onClick={() => {
                      setCheckoutStep('review');
                      setOrderData(null);
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
