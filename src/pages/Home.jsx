import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// Scroll reveal hook
const useScrollReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const el = ref.current;
    if (el) {
      const targets = el.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
      targets.forEach(t => observer.observe(t));
    }
    return () => observer.disconnect();
  }, []);
  return ref;
};

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const images = [
    { src: '/images/slider/slide1.jpg', pos: 'center 30%' },
    { src: '/images/slider/slide2.jpg', pos: 'center 75%' }, // Tennis
    { src: '/images/slider/slide3.jpg', pos: 'center 30%' },
    { src: '/images/slider/slide4.jpg', pos: 'center 30%' },
    { src: '/images/slider/slide5.jpg', pos: 'center 70%' }, // Basketball
    { src: '/images/slider/slide6.jpg', pos: 'center' }      // General Sports
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-slider-wrap">
      {images.map((item, i) => (
        <img
          key={i}
          src={item.src}
          alt={`Слайд ${i + 1}`}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: item.pos,
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: i === current ? 1 : 0
          }}
        />
      ))}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const pageRef = useScrollReveal();
  const { t } = useLanguage();

  return (
    <div ref={pageRef}>
      <HeroSlider />
      {/* ===== HERO ===== */}
      <section className="hero-section hero-section-home">
        <div className="hero-badge">
          {t('home.hero.badge')}
        </div>

        <h1 className="hero-title">
          <span className="text-gradient">{t('home.hero.title1')}</span><br />
          <span className="text-gradient-orange">{t('home.hero.title2')}</span>
        </h1>

        <p className="hero-subtitle">
          {t('home.hero.subtitle')}
        </p>

        <div className="hero-actions">
          <button 
            className="btn btn-primary" 
            style={{ fontSize: '1.05rem', padding: '16px 36px' }}
            onClick={() => navigate('/sections')}
          >
            {t('home.hero.btnA')}
          </button>
          <button 
            className="btn btn-blue" 
            style={{ fontSize: '1.05rem', padding: '16px 36px' }}
            onClick={() => navigate('/clubs')}
          >
            {t('home.hero.btnB')}
          </button>
          <button 
            className="btn btn-outline" 
            style={{ fontSize: '1.05rem', padding: '16px 36px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
            onClick={() => {
              if (sessionStorage.getItem('adminAuth') === 'true') navigate('/admin', { state: { tab: 'library' } });
              else navigate('/library');
            }}
          >
            <img src="/images/books.png" alt="Библиотека" style={{ width: '20px', height: '20px', objectFit: 'contain' }} /> {t('home.hero.btnLibrary')}
          </button>
        </div>
      </section>

      {/* ===== О ПЛАТФОРМЕ ===== */}
      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="section-header">
          <div className="reveal">
            <span className="section-label section-label-orange">{t('home.about.label')}</span>
          </div>
          <h2 className="section-title reveal" style={{ transitionDelay: '0.1s' }}>
            <span className="text-gradient-mixed">{t('home.about.title')}</span>
          </h2>
          <p className="section-subtitle reveal" style={{ transitionDelay: '0.15s' }}>
            {t('home.about.subtitle')}
          </p>
        </div>

        <div className="features-grid" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="feature-card reveal stagger-1" onClick={() => navigate('/sections')}>
            <div className="feature-icon feature-icon-orange">
              <img src="/images/basketball.png" alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = '🏀'; }} />
            </div>
            <h3 className="feature-title">{t('home.feat1.title')}</h3>
            <p className="feature-text">{t('home.feat1.text')}</p>
          </div>

          <div className="feature-card reveal stagger-2" onClick={() => navigate('/clubs')}>
            <div className="feature-icon feature-icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="0.5"/><circle cx="17.5" cy="10.5" r="0.5"/><circle cx="8.5" cy="7.5" r="0.5"/><circle cx="6.5" cy="12" r="0.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
            </div>
            <h3 className="feature-title">{t('home.feat2.title')}</h3>
            <p className="feature-text">{t('home.feat2.text')}</p>
          </div>

          <div className="feature-card reveal stagger-3" onClick={() => {
              if (sessionStorage.getItem('adminAuth') === 'true') navigate('/admin', { state: { tab: 'library' } });
              else navigate('/library');
            }}>
            <div className="feature-icon feature-icon-teal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <h3 className="feature-title">{t('home.feat3.title')}</h3>
            <p className="feature-text">{t('home.feat3.text')}</p>
          </div>
        </div>
      </section>

      {/* ===== СТАТИСТИКА ===== */}
      <section className="section">
        <div className="stats-grid">
          <div className="stat-card reveal stagger-1">
            <div className="stat-number" style={{ color: 'var(--color-orange)' }}>{t('home.stats.1.num')}</div>
            <div className="stat-label">{t('home.stats.1.label')}</div>
          </div>
          <div className="stat-card reveal stagger-2">
            <div className="stat-number" style={{ color: 'var(--color-blue-light)' }}>{t('home.stats.2.num')}</div>
            <div className="stat-label">{t('home.stats.2.label')}</div>
          </div>
          <div className="stat-card reveal stagger-3">
            <div className="stat-number" style={{ color: 'var(--color-accent)' }}>{t('home.stats.3.num')}</div>
            <div className="stat-label">{t('home.stats.3.label')}</div>
          </div>
          <div className="stat-card reveal stagger-4">
            <div className="stat-number" style={{ color: 'var(--color-orange-light)' }}>{t('home.stats.4.num')}</div>
            <div className="stat-label">{t('home.stats.4.label')}</div>
          </div>
        </div>
      </section>

      {/* ===== КАК ЭТО РАБОТАЕТ ===== */}
      <section className="section">
        <div className="section-header">
          <div className="reveal">
            <span className="section-label section-label-blue">{t('home.steps.label')}</span>
          </div>
          <h2 className="section-title reveal" style={{ transitionDelay: '0.1s' }}>
            {t('home.steps.title')}
          </h2>
          <p className="section-subtitle reveal" style={{ transitionDelay: '0.15s' }}>
            {t('home.steps.subtitle')}
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card reveal stagger-1">
            <div className="step-number" style={{ background: 'rgba(232, 119, 34, 0.15)', color: 'var(--color-orange)' }}>1</div>
            <h3 className="step-title">{t('home.steps.1.title')}</h3>
            <p className="step-text">{t('home.steps.1.text')}</p>
          </div>
          <div className="step-card reveal stagger-2">
            <div className="step-number" style={{ background: 'rgba(29, 93, 192, 0.15)', color: 'var(--color-blue-light)' }}>2</div>
            <h3 className="step-title">{t('home.steps.2.title')}</h3>
            <p className="step-text">{t('home.steps.2.text')}</p>
          </div>
          <div className="step-card reveal stagger-3">
            <div className="step-number" style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--color-accent)' }}>3</div>
            <h3 className="step-title">{t('home.steps.3.title')}</h3>
            <p className="step-text">{t('home.steps.3.text')}</p>
          </div>
        </div>
      </section>

      {/* ===== ПРЕИМУЩЕСТВА ===== */}
      <section className="section">
        <div className="section-header">
          <div className="reveal">
            <span className="section-label section-label-orange">{t('home.adv.label')}</span>
          </div>
          <h2 className="section-title reveal" style={{ transitionDelay: '0.1s' }}>
            {t('home.adv.title1')} <span className="text-gradient-orange">{t('home.adv.title2')}</span>
          </h2>
        </div>

        <div className="features-grid" style={{ maxWidth: '1100px', margin: '0 auto', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="feature-card reveal stagger-1" style={{ cursor: 'default' }}>
            <div className="feature-icon feature-icon-orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3 className="feature-title">{t('home.adv1.title')}</h3>
            <p className="feature-text">{t('home.adv1.text')}</p>
          </div>

          <div className="feature-card reveal stagger-2" style={{ cursor: 'default' }}>
            <div className="feature-icon feature-icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="feature-title">{t('home.adv2.title')}</h3>
            <p className="feature-text">{t('home.adv2.text')}</p>
          </div>

          <div className="feature-card reveal stagger-3" style={{ cursor: 'default' }}>
            <div className="feature-icon feature-icon-teal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </div>
            <h3 className="feature-title">{t('home.adv3.title')}</h3>
            <p className="feature-text">{t('home.adv3.text')}</p>
          </div>

          <div className="feature-card reveal stagger-4" style={{ cursor: 'default' }}>
            <div className="feature-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="feature-title">{t('home.adv4.title')}</h3>
            <p className="feature-text">{t('home.adv4.text')}</p>
          </div>
        </div>
      </section>

      {/* ===== НАПРАВЛЕНИЯ ===== */}
      <section className="section">
        <div className="section-header">
          <div className="reveal">
            <span className="section-label section-label-blue">{t('home.dir.label')}</span>
          </div>
          <h2 className="section-title reveal" style={{ transitionDelay: '0.1s' }}>
            {t('home.dir.title1')} <span className="text-gradient-blue">{t('home.dir.title2')}</span>
          </h2>
          <p className="section-subtitle reveal" style={{ transitionDelay: '0.15s' }}>
            {t('home.dir.subtitle')}
          </p>
        </div>

        <div className="directions-grid">
          {/* Спортивные секции */}
          <div className="reveal stagger-1" style={{
            background: 'linear-gradient(145deg, rgba(232, 119, 34, 0.06), rgba(12, 20, 40, 0.5))',
            border: '1px solid rgba(232, 119, 34, 0.15)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
          }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--color-orange)' }}>
              {t('dir.sec.title')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: t('dir.sec.1.name'), desc: t('dir.sec.1.desc'), img: '/images/basketball.png' },
                { name: t('dir.sec.2.name'), desc: t('dir.sec.2.desc'), img: '/images/football.png' },
                { name: t('dir.sec.3.name'), desc: t('dir.sec.3.desc'), img: '/images/volleyball.png' },
                { name: t('dir.sec.4.name'), desc: t('dir.sec.4.desc'), img: '/images/tennis.png' },
                { name: t('dir.sec.5.name'), desc: t('dir.sec.5.desc'), img: '/images/chess.png' },
              ].map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px', borderRadius: '12px',
                  background: 'rgba(0,0,0,0.15)', transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232, 119, 34, 0.1)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                onClick={() => navigate('/sections')}
                >
                  {s.img ? (
                    <img src={s.img} alt={s.name} style={{ width: '36px', height: '36px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }} />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(232,119,34,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                      {s.name === 'Настольный теннис' ? '🏓' : '♟️'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '20px', width: '100%' }}
              onClick={() => navigate('/sections')}
            >
              {t('home.dir.btn1')}
            </button>
          </div>

          {/* Творческие кружки */}
          <div className="reveal stagger-2" style={{
            background: 'linear-gradient(145deg, rgba(29, 93, 192, 0.06), rgba(12, 20, 40, 0.5))',
            border: '1px solid rgba(29, 93, 192, 0.15)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
          }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--color-blue-light)' }}>
              {t('dir.club.title')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: t('dir.club.1.name'), desc: t('dir.club.1.desc'), img: '/images/robot.png' },
                { name: t('dir.club.2.name'), desc: t('dir.club.2.desc'), img: '/images/palette.png' },
                { name: t('dir.club.3.name'), desc: t('dir.club.3.desc'), img: '/images/music.png' },
                { name: t('dir.club.4.name'), desc: t('dir.club.4.desc'), img: '/images/teatr.png' },
              ].map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px', borderRadius: '12px',
                  background: 'rgba(0,0,0,0.15)', transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(29, 93, 192, 0.1)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                onClick={() => navigate('/clubs')}
                >
                  {s.img ? (
                    <img 
                      src={s.img} 
                      alt={s.name} 
                      style={{ width: '36px', height: '36px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }} 
                    />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(29,93,192,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                      {s.icon}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="btn btn-blue" 
              style={{ marginTop: '20px', width: '100%' }}
              onClick={() => navigate('/clubs')}
            >
              {t('home.dir.btn2')}
            </button>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section" style={{ paddingBottom: '60px' }}>
        <div className="cta-section reveal-scale">
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '16px' }}>
            {t('home.cta.title1')} <span className="text-gradient-orange">{t('home.cta.title2')}</span> 
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            {t('home.cta.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '16px 36px' }} onClick={() => navigate('/sections')}>
              {t('home.cta.btn1')}
            </button>
            <button className="btn btn-outline" style={{ fontSize: '1.05rem', padding: '16px 36px' }} onClick={() => {
              if (sessionStorage.getItem('adminAuth') === 'true') navigate('/admin', { state: { tab: 'library' } });
              else navigate('/library');
            }}>
              {t('home.cta.btn2')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;