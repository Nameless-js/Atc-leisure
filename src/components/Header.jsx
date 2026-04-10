import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <header className="header" style={{ boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.5)' : 'none' }}>
      {/* Logo */}
      <div className="header-logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
        ATC <span>Leisure</span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: '12px' }}>
        {!isHome && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/')}
          >
            ← Главная
          </button>
        )}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/admin')}
        >
          🔐 Я преподаватель
        </button>
      </nav>
    </header>
  );
};

export default Header;