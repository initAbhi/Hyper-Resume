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
  Monitor,
  LogOut,
  MailCheck,
  Receipt,
  Printer,
} from 'lucide-react';
import {
  apiClient,
  CandidateProfile,
  CreditLedgerItem,
  type UserSessionItem,
} from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const router = useRouter();
  const { user, creditBalance, hasActivePro, refreshUser, clearAuth } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profile, setProfile] = useState<Partial<CandidateProfile>>({});
  const [creditsHistory, setCreditsHistory] = useState<CreditLedgerItem[]>([]);
  const [sessions, setSessions] = useState<UserSessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [verifyFeedback, setVerifyFeedback] = useState<string | null>(null);
  const [isResendingVerify, setIsResendingVerify] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.fullName) {
      setFullName((prev) => prev || user.fullName || '');
    }
  }, [user?.fullName]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [profData, historyData, sessionsData] = await Promise.all([
          apiClient.getMyProfile().catch(() => null),
          apiClient.getCreditHistory().catch(() => []),
          apiClient.listSessions().catch(() => [] as UserSessionItem[]),
        ]);
        if (!isMounted) return;
        if (profData) setProfile(profData);
        const safeHistory = Array.isArray(historyData)
          ? historyData
          : ((historyData as unknown) as { items?: CreditLedgerItem[] })?.items || [];
        setCreditsHistory(safeHistory);
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
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
      const tasks: Promise<unknown>[] = [
        apiClient.updateMyProfile({
          headline: profile.headline || '',
          summary: profile.summary || '',
          location: profile.location || '',
          phone: profile.phone || '',
          linkedinUrl: profile.linkedinUrl || '',
          githubUrl: profile.githubUrl || '',
        }),
      ];
      if (fullName.trim() && fullName.trim() !== (user?.fullName || '')) {
        tasks.push(apiClient.updateCurrentUser({ fullName: fullName.trim() }));
      }
      await Promise.all(tasks);
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

  const handleResendVerification = async () => {
    setIsResendingVerify(true);
    setVerifyFeedback(null);
    try {
      const res = await apiClient.resendVerificationEmail();
      setVerifyFeedback(res.message || 'Verification email sent. Check your inbox.');
    } catch (err: unknown) {
      setVerifyFeedback(
        err instanceof Error ? err.message : 'Unable to send verification email right now.',
      );
    } finally {
      setIsResendingVerify(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      await apiClient.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to revoke session.');
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleLogoutAllSessions = async () => {
    setIsRevokingAll(true);
    try {
      await apiClient.logoutAllSessions();
      clearAuth();
      router.push('/login');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to sign out all devices.');
      setIsRevokingAll(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    try {
      const [resumes, applications, me, coverLetters, jobMatches, interviews, linkedinAudits] =
        await Promise.all([
          apiClient.listResumes().catch(() => []),
          apiClient.listApplications().catch(() => []),
          apiClient.getMe(),
          apiClient.listCoverLetters().catch(() => []),
          apiClient.listJobMatches().catch(() => []),
          apiClient.listInterviewSessions({ limit: 50 }).catch(() => ({ items: [], total: 0 })),
          apiClient.listLinkedInAudits().catch(() => []),
        ]);

      const exportBundle = {
        exportedAt: new Date().toISOString(),
        user: me.user,
        creditBalance: me.creditBalance,
        profile,
        resumes,
        applications,
        coverLetters,
        jobMatches,
        interviews: interviews.items || [],
        linkedinAudits,
        creditsHistory,
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
      setSuccessMessage('Complete account data bundle exported successfully.');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);
    if (newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    setIsChangingPassword(true);
    try {
      await apiClient.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordFeedback({ type: 'success', text: 'Password updated and other active sessions revoked.' });
    } catch (err: unknown) {
      setPasswordFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to update password.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Type DELETE in the confirmation box to permanently remove your account.');
      return;
    }
    setDeleteError(null);
    setIsDeletingAccount(true);
    try {
      await apiClient.deleteAccount();
      clearAuth();
      router.push('/');
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Account deletion failed.');
      setIsDeletingAccount(false);
    }
  };

  const handlePrintReceipt = (item: CreditLedgerItem) => {
    if (typeof window === 'undefined') return;
    const win = window.open('', '_blank', 'width=720,height=640');
    if (!win) return;
    const safeDesc = item.description.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeName = (user?.fullName || 'Customer').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeEmail = (user?.email || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    win.document.write(`<!doctype html><html><head><title>HypeResume Receipt ${item.id.slice(0, 8)}</title><style>body{font-family:Inter,system-ui,sans-serif;padding:40px;color:#111827;max-width:640px;margin:0 auto;}h1{font-size:20px;margin-bottom:4px;}table{width:100%;border-collapse:collapse;margin-top:24px;}td,th{padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:left;font-size:13px;}.muted{color:#6b7280;font-size:12px;}</style></head><body><h1>HypeResume Billing Receipt</h1><p class="muted">Receipt ID: ${item.id} · Date: ${new Date(item.createdAt).toLocaleString()}</p><p style="margin-top:16px;font-size:13px;"><strong>Billed To:</strong> ${safeName} (${safeEmail})</p><table><thead><tr><th>Description</th><th>Type</th><th>Credits / Units</th></tr></thead><tbody><tr><td>${safeDesc}</td><td>${item.transactionType}</td><td>${item.amount > 0 ? '+' + item.amount : item.amount}</td></tr></tbody></table><p class="muted" style="margin-top:28px;">Thank you for using HypeResume.</p><script>window.onload=function(){window.print();}</script></body></html>`);
    win.document.close();
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
                <label htmlFor="settings-full-name" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  id="settings-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="settings-email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Email Address
                  </label>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      user?.isEmailVerified
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                    }`}
                  >
                    <MailCheck className="w-3 h-3" />
                    {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <input
                  id="settings-email"
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-not-allowed"
                />
                {!user?.isEmailVerified && (
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      {verifyFeedback || 'Verify your email to secure account recovery.'}
                    </span>
                    <button
                      type="button"
                      disabled={isResendingVerify}
                      onClick={handleResendVerification}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isResendingVerify ? 'Sending...' : 'Resend Link'}
                    </button>
                  </div>
                )}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <Input
                id="profile-github"
                label="GitHub Profile URL"
                placeholder="https://github.com/username"
                value={profile.githubUrl || ''}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="profile-summary" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Executive Career Summary
              </label>
              <textarea
                id="profile-summary"
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
              <p className="text-xs text-zinc-500 dark:text-zinc-400">No credit ledger events recorded yet.</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {(Array.isArray(creditsHistory) ? creditsHistory : []).slice(0, 10).map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {item.description}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.amount > 0 && (
                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(item)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                          title="Print billing receipt"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      )}
                      <Badge variant={item.amount > 0 ? 'success' : 'neutral'}>
                        {item.amount > 0 ? `+${item.amount}` : item.amount}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions & Device Security (FN-44) */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="w-4 h-4 text-zinc-500" />
                Active Sessions &amp; Devices
              </CardTitle>
              <CardDescription>
                Inspect active sign-in sessions and remotely sign out unrecognized devices.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isRevokingAll}
              onClick={handleLogoutAllSessions}
              className="gap-1.5 text-xs shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out All Devices</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Current browser session is active.
            </p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {sessions.map((sess) => (
                <div key={sess.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {sess.userAgent || 'Browser Session'}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      IP: {sess.ipAddress || 'Unknown'} · Started {new Date(sess.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={revokingSessionId === sess.id}
                    onClick={() => handleRevokeSession(sess.id)}
                    className="text-[11px] h-7 shrink-0"
                  >
                    {revokingSessionId === sess.id ? 'Revoking...' : 'Revoke'}
                  </Button>
                </div>
              ))}
            </div>
          )}
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
            isLoading={isExporting}
            onClick={handleExportData}
            className="gap-2 text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete Data Archive (JSON)</span>
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
            Update your account password (revokes all other active sessions). If you signed in exclusively with Google, use{' '}
            <Link href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Set Initial Password via Forgot Password
            </Link>.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4">
            {passwordFeedback && (
              <Alert variant={passwordFeedback.type === 'success' ? 'success' : 'destructive'}>
                {passwordFeedback.text}
              </Alert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <Input
                id="confirm-password"
                type="password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            Delete Account &amp; Data
          </CardTitle>
          <CardDescription>
            Permanently delete your account, resumes, AI audit history, and uploaded files. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {deleteError && <Alert variant="destructive">{deleteError}</Alert>}
          <div className="space-y-1.5">
            <label htmlFor="delete-account-confirm" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Confirmation (type DELETE)
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                id="delete-account-confirm"
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
