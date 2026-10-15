'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import {
  Shield,
  Download,
} from 'lucide-react';
import {
  apiClient,
  CandidateProfile,
  CreditLedgerItem,
} from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { user, creditBalance, refreshUser } = useAuth();
  const [profile, setProfile] = useState<Partial<CandidateProfile>>({});
  const [creditsHistory, setCreditsHistory] = useState<CreditLedgerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [profData, historyData] = await Promise.all([
          apiClient.getMyProfile().catch(() => null),
          apiClient.getCreditHistory().catch(() => []),
        ]);
        if (!isMounted) return;
        if (profData) setProfile(profData);
        setCreditsHistory(historyData);
      } catch (err: unknown) {
        if (!isMounted) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load profile data',
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await apiClient.updateMyProfile({
        headline: profile.headline || '',
        summary: profile.summary || '',
        location: profile.location || '',
        phone: profile.phone || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
      });
      await refreshUser();
      setSuccessMessage('Profile information saved successfully.');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update profile',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const [resumes, applications, me] = await Promise.all([
        apiClient.listResumes(),
        apiClient.listApplications(),
        apiClient.getMe(),
      ]);

      const exportBundle = {
        exportedAt: new Date().toISOString(),
        user: me.user,
        creditBalance: me.creditBalance,
        profile,
        resumes,
        applications,
      };

      const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hyperresume-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Export failed');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-zinc-500 animate-pulse">
        Loading account settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Account, Privacy & Workspace Control
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage your master profile, AI privacy boundaries, and complete data ownership.
        </p>
      </div>

      {successMessage && (
        <Alert variant="success">{successMessage}</Alert>
      )}
      {errorMessage && (
        <Alert variant="destructive">{errorMessage}</Alert>
      )}

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Master Candidate Profile</CardTitle>
          <CardDescription>
            Baseline credentials used to seed new resume variants.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.fullName || ''}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="profile-headline"
                label="Professional Headline"
                placeholder="e.g. Senior Software Engineer"
                value={profile.headline || ''}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              />
              <Input
                id="profile-location"
                label="Location"
                placeholder="e.g. Bengaluru, India"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="profile-phone"
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
              <Input
                id="profile-linkedin"
                label="LinkedIn Profile URL"
                placeholder="https://linkedin.com/in/username"
                value={profile.linkedinUrl || ''}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Executive Career Summary
              </label>
              <textarea
                rows={3}
                placeholder="High-level career narrative..."
                value={profile.summary || ''}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </CardContent>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              Save Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Credit Balance & History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">AI Optimization Credits</CardTitle>
              <CardDescription>
                Credits used for full job matching and STAR/XYZ bullet rewrites.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-blue-600">{creditBalance}</span>
              <span className="text-xs font-semibold text-zinc-500">Credits Available</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Transaction History
            </span>
            {creditsHistory.length === 0 ? (
              <p className="text-xs text-zinc-400">No credit ledger events recorded yet.</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {creditsHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {item.description}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={item.amount > 0 ? 'success' : 'neutral'}>
                      {item.amount > 0 ? `+${item.amount}` : item.amount}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Privacy & Model Boundaries */}
      <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-900 space-y-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-blue-950 dark:text-blue-100">
              Zero-Training Privacy Guarantee
            </h2>
            <p className="text-xs text-blue-900/90 dark:text-blue-300 mt-1 leading-relaxed">
              HyperResume enforces zero data retention with AI LLM providers. Your resume history, employment credentials, and job descriptions are <strong>never</strong> used to train or refine public or proprietary foundation models.
            </p>
          </div>
        </div>
      </div>

      {/* Data Export & Portability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Portability & Export</CardTitle>
          <CardDescription>
            You own 100% of your career data. Export your full Master Profile, tailored variants, and application history at any time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            className="gap-2 text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export All Data (JSON)</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
