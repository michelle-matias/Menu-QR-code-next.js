'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import '@/styles/auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Por favor, preencha email e password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert('Login falhou: ' + error.message);
        return;
      }

      if (data.user) {
        alert('Login com sucesso! Bem-vindo, ' + data.user.email);
        router.push('/dashboard');
      }
    } catch (err: any) {
      alert('Ocorreu um erro inesperado: ' + err.message);
    } finally {
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
        <Link href="/" className="auth-btn-main-page">
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
