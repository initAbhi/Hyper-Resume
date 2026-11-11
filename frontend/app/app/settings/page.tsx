'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import {
  Shield,
  Download,
  Sparkles,
  KeyRound,
  Trash2,
} from 'lucide-react';
import {
  apiClient,
  CandidateProfile,
  CreditLedgerItem,
} from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const router = useRouter();
  const { user, creditBalance, hasActivePro, refreshUser } = useAuth();
  const [profile, setProfile] = useState<Partial<CandidateProfile>>({});
  const [creditsHistory, setCreditsHistory] = useState<CreditLedgerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [profData, historyData] = await Promise.all([
          apiClient.getMyProfile().catch(() => null),
          apiClient.getCreditHistory().catch(() => []),
        ]);
        if (profData) setProfile(profData);
        const safeHistory = Array.isArray(historyData)
          ? historyData
          : ((historyData as unknown) as { items?: CreditLedgerItem[] })?.items || [];
        setCreditsHistory(safeHistory);
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
      a.download = `hype-resume-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }
    setIsChangingPassword(true);
    try {
      await apiClient.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setSuccessMessage('Password updated cleanly.');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setErrorMessage('Type DELETE in the confirmation box to permanently remove your account.');
      return;
    }
    setErrorMessage(null);
    setIsDeletingAccount(true);
    try {
      await apiClient.deleteAccount();
      router.push('/');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Account deletion failed.');
      setIsDeletingAccount(false);
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

      {/* Membership & Access Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                HypeResume Membership
              </CardTitle>
              <CardDescription>
                {hasActivePro
                  ? user?.isLifetimePro
                    ? 'Founding Lifetime Pro — Unlimited AI features unlocked permanently.'
                    : `HypeResume Pro Active until ${
                        user?.proExpiresAt ? new Date(user.proExpiresAt).toLocaleDateString() : 'Active'
                      }`
                  : 'Free Starter tier — upgrade anytime for unlimited AI tailoring, cover letters & mock interviews.'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={hasActivePro ? 'success' : 'neutral'}>
                {hasActivePro ? (user?.isLifetimePro ? 'Lifetime Pro' : 'Pro Active') : 'Free Starter'}
              </Badge>
              {!user?.isLifetimePro && (
                <Link href="/pricing">
                  <Button variant="primary" size="sm" className="text-xs">
                    {hasActivePro ? 'Extend Pass' : 'Upgrade to Pro'}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

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
            {(Array.isArray(creditsHistory) ? creditsHistory : []).length === 0 ? (
              <p className="text-xs text-zinc-400">No credit ledger events recorded yet.</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {(Array.isArray(creditsHistory) ? creditsHistory : []).slice(0, 5).map((item) => (
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
      <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Candidate Privacy & LLM Data Governance
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              HypeResume enforces strict confidentiality. Your career documents, contact information, and target job descriptions are processed with stateless API calls and are never used to train public foundation models.
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

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-zinc-500" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password. (If you signed in exclusively with Google, set one via Forgot Password.)
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="current-password"
                type="password"
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                id="new-password"
                type="password"
                label="New Password (min 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <Button type="submit" variant="outline" size="sm" isLoading={isChangingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone: GDPR Self-Serve Delete Account */}
      <Card className="border-rose-200 dark:border-rose-900/60">
        <CardHeader>
          <CardTitle className="text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Account & Data
          </CardTitle>
          <CardDescription>
            Permanently delete your account, resumes, AI audit history, and uploaded files. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <input
              type="text"
              placeholder="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAccount}
              isLoading={isDeletingAccount}
              className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              Permanently Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
