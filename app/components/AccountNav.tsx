'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';

function initialsFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'U';
  return local.slice(0, 2).toUpperCase();
}

export default function AccountNav() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, []);

  if (loading) {
    return <span className="header-login is-loading" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <a className="header-login" href="/login">
        Log in
      </a>
    );
  }

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        type="button"
        className="account-avatar"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        {initialsFromEmail(user.email)}
      </button>
      {open ? (
        <div className="account-dropdown" role="menu">
          <p className="account-email">{user.email}</p>
          <a href="/profile" role="menuitem" onClick={() => setOpen(false)}>
            Profile
          </a>
          <a href="/saved-opportunities" role="menuitem" onClick={() => setOpen(false)}>
            Saved Opportunities
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout();
              window.location.href = '/';
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
