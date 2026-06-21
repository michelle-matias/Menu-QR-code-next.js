'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
        router.replace('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fdfbe8',
        fontFamily: 'Jost, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-qrcode fa-spin" style={{ fontSize: '3rem', color: '#5d7a5d', marginBottom: '1rem' }}></i>
          <p style={{ color: '#5d7a5d', fontWeight: 600 }}>Loading Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="dashboard-body">
      <Header isDashboard={true} />
      <div className="main-layout">
        <Sidebar />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}
