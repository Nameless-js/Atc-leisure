import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero-section">
        <div className="hero-badge">
          ✨ Алматинский технологический колледж
        </div>

        <h1 className="hero-title">
          <span className="text-gradient">Будущее начинается</span><br />
          <span className="text-gradient-teal">здесь и сейчас</span>
        </h1>

        <p className="hero-subtitle">
          ATC Leisure — это уникальная экосистема для твоей внеучебной жизни. Записывайся на спортивные секции, развивай таланты в кружках и пользуйся умной библиотекой без бумажной волокиты.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '380px' }}>
          
          <button 
            className="btn btn-primary" 
            style={{ fontSize: '1.2rem', padding: '18px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}
            onClick={() => navigate('/library')}
          >
            <span>📚</span> Сканировать QR
          </button>

          <button 
            className="btn glass-card" 
            style={{ fontSize: '1.1rem', padding: '16px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', border: '1px solid rgba(249, 115, 22, 0.4)', color: 'white' }}
            onClick={() => navigate('/sections')}
          >
            <span>⚽</span> Ознакомиться с секциями
          </button>

          <button 
            className="btn glass-card" 
            style={{ fontSize: '1.1rem', padding: '16px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', border: '1px solid rgba(168, 85, 247, 0.4)', color: 'white' }}
            onClick={() => navigate('/clubs')}
          >
            <span>🎨</span> Ознакомиться с кружками
          </button>

        </div>
      </section>
      
      {/* Short Feature Banner */}
      <section style={{ padding: '0 5% 100px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '40px' }}>
          Одной платформой мы заменяем долгие бюрократические процессы
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '2.5rem', color: '#0ea5e9' }}>1.5s</h4>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Среднее время брони книги</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '2.5rem', color: '#f97316' }}>100%</h4>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Автоматизация расписания</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '2.5rem', color: '#a855f7' }}>24/7</h4>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Доступ к платформе</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;