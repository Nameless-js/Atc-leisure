import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message === 'Failed to fetch' 
            ? 'Failed to fetch: Ошибка сети. Проверьте правильность VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY (он должен начинаться с eyJ) в файле .env' 
            : error.message);
        } else {
          navigate('/');
        }
      } else {
        if (!fullName.trim()) {
          setError(t('auth.error.name_required'));
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message === 'Failed to fetch' 
            ? 'Failed to fetch: Ошибка сети. Проверьте правильность VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY (он должен начинаться с eyJ) в файле .env' 
            : error.message);
        } else {
          setSuccess(t('auth.success.registered'));
        }
      }
    } catch (err) {
      setError(err.message === 'Failed to fetch' 
        ? 'Failed to fetch: Ошибка сети. Проверьте правильность VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY (он должен начинаться с eyJ) в файле .env' 
        : err.message);
    }
    setLoading(false);
  };

  return (
    <div className="page-wrapper container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '40px 32px' }}>
        
        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          marginBottom: '28px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '12px',
          padding: '4px',
          gap: '4px',
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              transition: 'all 0.3s ease',
              background: mode === 'login' ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'transparent',
              color: mode === 'login' ? '#fff' : 'var(--text-secondary)',
              boxShadow: mode === 'login' ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
            }}
          >
            {t('auth.tab.login')}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              transition: 'all 0.3s ease',
              background: mode === 'register' ? 'linear-gradient(135deg, #E87722, #f59e0b)' : 'transparent',
              color: mode === 'register' ? '#fff' : 'var(--text-secondary)',
              boxShadow: mode === 'register' ? '0 4px 15px rgba(232, 119, 34, 0.3)' : 'none',
            }}
          >
            {t('auth.tab.register')}
          </button>
        </div>

        <h2 style={{ marginBottom: '8px', textAlign: 'center', fontSize: '1.5rem' }}>
          {mode === 'login' ? t('auth.login.title') : t('auth.register.title')}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
          {mode === 'login' ? t('auth.login.subtitle') : t('auth.register.subtitle')}
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: '#ef4444',
            marginBottom: '16px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            color: '#10b981',
            marginBottom: '16px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">{t('auth.field.name')}</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder={t('auth.field.name.placeholder')}
                required
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('auth.field.email.placeholder')}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">{t('auth.field.password')}</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('auth.field.password.placeholder')}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              background: mode === 'login'
                ? 'linear-gradient(135deg, #0ea5e9, #6366f1)'
                : 'linear-gradient(135deg, #E87722, #f59e0b)',
              border: 'none',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? t('auth.btn.loading')
              : (mode === 'login' ? t('auth.btn.login') : t('auth.btn.register'))
            }
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontFamily: 'inherit',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >
            ← {t('nav.main')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
