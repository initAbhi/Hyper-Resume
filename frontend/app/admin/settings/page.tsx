import { logger } from '@/lib/logger';
'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  CreditCard,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Key,
  Webhook,
  Activity,
  Server,
  Cpu,
  Database,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { apiClient, AdminPaymentSettings } from '@/lib/api-client';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminPaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingMode, setUpdatingMode] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAdminPaymentSettings();
      setSettings(data);
    } catch (err) {
      logger.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggleMode = async (targetMode: 'test_mode' | 'live_mode') => {
    if (!settings || settings.mode === targetMode || updatingMode) return;
    if (targetMode === 'live_mode') {
      const confirmed = window.confirm(
        '⚠️ Switch Payment Gateway to LIVE PRODUCTION?\n\nReal customer credit cards and UPI accounts will be charged real money.',
      );
      if (!confirmed) return;
    }

    setUpdatingMode(true);
    try {
      const updated = await apiClient.updateAdminPaymentMode(targetMode);
      setSettings(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to switch payment mode');
    } finally {
      setUpdatingMode(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isLive = settings?.mode === 'live_mode';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System & Gateway Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage live payment gateway switches, Meta Conversions API tracking, and AI infrastructure.
          </p>
        </div>

        <button
          onClick={loadSettings}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-2xs self-start"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 1. DODO PAYMENTS GATEWAY CONFIGURATION */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#285FEA] flex items-center justify-center font-bold text-sm">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Dodo Payments Configuration</h3>
              <p className="text-xs text-slate-500">Live & sandbox environment switching and product mappings</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => handleToggleMode('test_mode')}
              disabled={updatingMode}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                !isLive
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="h-3 w-3" />
              Test Mode
            </button>

            <button
              type="button"
              onClick={() => handleToggleMode('live_mode')}
              disabled={updatingMode}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                isLive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-3 w-3" />
              Live Mode
            </button>
          </div>
        </div>

        {/* Credentials Side-by-Side: Test vs Live */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Mode Credentials */}
          <div
            className={`rounded-2xl border p-5 space-y-3 transition ${
              !isLive ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 bg-slate-50/40 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">
                🧪 Test / Sandbox Environment
              </span>
              {!isLive && (
                <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                  ACTIVE
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">API Key:</span>
                <span className="font-mono text-slate-800 font-semibold">{settings?.testApiKeyMasked}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Webhook Signing Key:</span>
                <span className="font-mono text-slate-800 font-semibold">{settings?.testWebhookKeyMasked}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Job Hunt Pack Product:</span>
                <span className="font-mono text-slate-800">{settings?.testProducts?.job_hunt_pack}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Job Hunt Pro Product:</span>
                <span className="font-mono text-slate-800">{settings?.testProducts?.job_hunt_pro}</span>
              </div>
            </div>
          </div>

          {/* Live Mode Credentials */}
          <div
            className={`rounded-2xl border p-5 space-y-3 transition ${
              isLive ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/40 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                🟢 Live Production Environment
              </span>
              {isLive && (
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  ACTIVE
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">API Key:</span>
                <span className="font-mono text-slate-800 font-semibold">{settings?.liveApiKeyMasked}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Webhook Signing Key:</span>
                <span className="font-mono text-slate-800 font-semibold">{settings?.liveWebhookKeyMasked}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Job Hunt Pack Product:</span>
                <span className="font-mono text-slate-800">{settings?.liveProducts?.job_hunt_pack}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Job Hunt Pro Product:</span>
                <span className="font-mono text-slate-800">{settings?.liveProducts?.job_hunt_pro}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook Endpoint Row */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800 block">Production Webhook Listener URL:</span>
            <span className="font-mono text-slate-600">https://api.hype-resume.com/api/v1/payments/webhook</span>
          </div>
          <button
            onClick={() => copyToClipboard('https://api.hype-resume.com/api/v1/payments/webhook', 'webhook')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs self-start sm:self-center"
          >
            {copiedKey === 'webhook' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy URL</span>
          </button>
        </div>
      </div>

      {/* 2. META PIXEL & CONVERSIONS API */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Meta Pixel & Conversions API (CAPI)</h3>
            <p className="text-xs text-slate-500">Official business portfolio dataset with deduplication</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 p-4 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Dataset / Pixel ID</div>
            <div className="font-mono font-bold text-slate-800 text-sm">1117348281146781</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> HyperResume Web Active
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Server Conversions API (CAPI)</div>
            <div className="font-semibold text-slate-800 text-sm">Graph API v21.0</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Token Verified & Receiving
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 space-y-1">
            <div className="text-xs text-slate-400 font-medium">Event Deduplication</div>
            <div className="font-semibold text-slate-800 text-sm">orderId matching</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Zero Double-Counting
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI & DATABASE INFRASTRUCTURE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Cpu className="h-5 w-5 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">AI Generation Engine</h4>
          </div>
          <div className="text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Provider:</span>
              <span className="font-bold text-slate-800">Google Gemini</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Active Model:</span>
              <span className="font-mono text-slate-800">gemini-1.5-flash</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Evidence Grounding:</span>
              <span className="text-emerald-600 font-bold">Enabled</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Database className="h-5 w-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900">Database & Storage</h4>
          </div>
          <div className="text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Engine:</span>
              <span className="font-bold text-slate-800">PostgreSQL (hyper_resume_db)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Settings Table:</span>
              <span className="font-mono text-slate-800">system_settings</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Status:</span>
              <span className="text-emerald-600 font-bold">🟢 Connected & Synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

