import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Проверяем авторизацию учителя при каждом изменении маршрута
  useEffect(() => {
    const checkAuth = () => {
      setIsTeacher(sessionStorage.getItem('adminAuth') === 'true');
    };
    checkAuth();
    // Слушаем кастомное событие для обновления состояния хедера
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, [location.pathname]);

  const isHome = location.pathname === '/';
  const isAdmin = location.pathname === '/admin';

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

        {!isHome && !isAdmin && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/')}
          >
            ← {t('nav.main')}
          </button>
        )}

        {isTeacher ? (
          <>
            {!isAdmin && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/admin')}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                }}
              >
                ⚙️ Админ Панель
              </button>
            )}
          </>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/admin')}
          >
            🔐 {t('nav.teacher')}
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;