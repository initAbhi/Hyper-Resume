'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!fullName.trim() || !email.trim() || !password) {
        throw new Error('All fields are required.');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }
      await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      router.push('/app');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please check your information and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-16 px-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join HyperResume to build stronger, evidence-backed resumes
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">{errorMessage}</Alert>
            )}
            <Input
              id="register-fullname"
              label="Full Name"
              type="text"
              placeholder="Abhishek Singh"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              id="register-email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="register-password"
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              helperText="Must contain at least 8 characters."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              id="register-submit-button"
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account (Includes 5 Free Credits)
            </Button>
            <p className="text-xs text-center text-zinc-500">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
