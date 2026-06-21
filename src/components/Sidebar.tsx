'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Deseja realmente sair?')) {
      await signOut();
      router.push('/');
    }
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="section-title">MANAGEMENT</div>
      <ul>
        <li className={isActive('/dashboard') && pathname === '/dashboard' ? 'active' : ''}>
          <Link href="/dashboard">
            <i className="fas fa-chart-line"></i> Estatístics
          </Link>
        </li>
        <li className={isActive('/menu') ? 'active' : ''}>
          <Link href="/menu">
            <i className="fas fa-bars"></i> Menu editor
          </Link>
        </li>
        <li className={isActive('/qr') ? 'active' : ''}>
          <Link href="/qr">
            <i className="fas fa-qrcode"></i> QR code
          </Link>
        </li>
        <li className={isActive('/orders') ? 'active' : ''}>
          <Link href="/orders">
            <i className="fas fa-clipboard-list"></i> Orders
          </Link>
        </li>
      </ul>

      <div className="section-title">ACCOUNT</div>
      <ul>
        <li>
          <Link href="/profile">
            <i className="far fa-user"></i> Profile
          </Link>
        </li>
        <li>
          <a href="#logout" onClick={handleSignOut} style={{ color: '#d32f2f' }}>
            <i className="fas fa-sign-out-alt"></i> Sair
          </a>
        </li>
      </ul>
    </aside>
  );
};
export default Sidebar;
