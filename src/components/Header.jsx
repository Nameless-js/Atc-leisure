import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = location.pathname === '/';
  const isAdmin = location.pathname === '/admin';
  const isAuth = location.pathname === '/auth';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Get display name from user metadata
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  return (
    <header className="header" style={{ boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.5)' : 'none' }}>
      {/* Logo */}
      <div className="header-logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
         <span>EduSpace</span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            background: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="ru" style={{color: '#000'}}>RU</option>
          <option value="kz" style={{color: '#000'}}>KZ</option>
          <option value="en" style={{color: '#000'}}>EN</option>
        </select>

        {!isHome && !isAdmin && !isAuth && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/')}
          >
            ← {t('nav.main')}
          </button>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              fontSize: '0.88rem', 
              color: 'var(--text-secondary)',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              👤 {displayName}
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleSignOut}
              style={{
                fontSize: '0.82rem',
                padding: '6px 14px',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
              }}
            >
              {t('auth.btn.logout')}
            </button>
          </div>
        ) : (
          !isAuth && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/auth')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              }}
            >
              🔐 {t('auth.btn.header_login')}
            </button>
          )
        )}
      </nav>
    </header>
  );
};

export default Header;