import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

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
        ATC <span>Leisure</span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {!isHome && !isAdmin && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/')}
          >
            ← Главная
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
            🔐 Я преподаватель
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;