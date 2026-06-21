'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  isDashboard?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isDashboard = false }) => {
  const { user } = useAuth();
  
  const restaurantName = user?.user_metadata?.display_name || user?.user_metadata?.displayName || '';

  return (
    <header className={isDashboard ? "top-bar" : "navbar"}>
      <div className="logo">
        <Link href="/">
          <i className="fas fa-qrcode"></i> Menu4U
        </Link>
        {user && restaurantName && (
          <span id="restaurant-name" style={{ marginLeft: '10px', fontWeight: '600' }}>
            | {restaurantName}
          </span>
        )}
      </div>
      <div className={isDashboard ? "nav-right" : "auth-buttons"}>
        {isDashboard ? (
          <Link href="/" className="btn-home-nav">
            Main Page
          </Link>
        ) : user ? (
          <Link href="/dashboard" className="btn-login">
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/register" className="btn-register">
              Registar
            </Link>
            <Link href="/login" className="btn-login">
              Login
            </Link>
          </>
        )}
      </div>
    </header>
  );
};
export default Header;
