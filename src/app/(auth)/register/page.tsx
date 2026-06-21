'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import '@/styles/auth.css';

export default function Register() {
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantName || !email || !password || !confirmPassword) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      alert('As passwords não coincidem.');
      return;
    }

    setLoading(true);

    // Setup 15-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setLoading(false);
      alert('O pedido demorou muito. Tente novamente.');
    }, 15000);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: restaurantName,
          },
        },
      });

      clearTimeout(timeoutId);

      if (error) {
        alert('Erro no registo: ' + error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setShowModal(true);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      alert('Ocorreu um erro inesperado: ' + err.message);
      setLoading(false);
    }
  };

  const handleModalLogin = () => {
    setShowModal(false);
    router.push('/login');
  };

  return (
    <div className="auth-page-body">
      {/* Navbar identical to legacy Create.html */}
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
            <p>Create your account to start</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label>Restaurant Name</label>
              <input 
                type="text" 
                placeholder="My Awesome Restaurant" 
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required 
              />
            </div>
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
            <div className="auth-input-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="auth-btn-submit" disabled={loading}>
              {loading ? 'A criar conta...' : 'Create account'}
            </button>
          </form>

          <div className="auth-card-footer">
            Already have an account? <Link href="/login">Sign in</Link>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      <div className={`auth-modal-overlay ${showModal ? 'active' : ''}`}>
        <div className="auth-modal-card">
          <div className="auth-modal-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>Conta criada com sucesso!</h2>
          <p>Seja bem-vindo ao Menu4U. Já pode fazer login na sua conta.</p>
          <button className="auth-btn-modal-action" onClick={handleModalLogin}>
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  );
}
