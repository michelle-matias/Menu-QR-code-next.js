'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import '@/styles/auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirect);
    }
  }, [user, authLoading, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha email e password.');
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Login falhou: ' + signInError.message);
        setLoading(false);
        return;
      }

      // Full navigation to ensure session cookies are recognized
      window.location.href = redirect;
    } catch (err: any) {
      setError('Ocorreu um erro inesperado: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-body">
      {/* Navbar identical to legacy login.html */}
      <header className="auth-navbar">
        <div className="logo">
          <Link href="/">
            <i className="fas fa-qrcode"></i> Menu4U
          </Link>
        </div>
        <Link href="/" className="btn-home-nav">
          Home Page
        </Link>
      </header>

      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <i className="fas fa-qrcode"></i>
            <h2>Menu4U</h2>
            <p>Sign in to manage your restaurant</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <p className="auth-error">{error}</p>}
            <div className="auth-input-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="exemplo@email.pt" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="auth-input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="auth-btn-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="auth-card-footer">
            <a href="#">Forgot password?</a> · <Link href="/register">Create account</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
