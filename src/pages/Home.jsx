import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div ref={pageRef}>
      <HeroSlider />
      {/* ===== HERO ===== */}
      <section className="hero-section hero-section-home">
        <div className="hero-badge">
          Колледж Информационных Технологий — Образовательная платформа
        </div>

        <h1 className="hero-title">
          <span className="text-gradient">Внеучебная жизнь</span><br />
          <span className="text-gradient-orange">без границ</span>
        </h1>

        <p className="hero-subtitle">
          ATC Leisure — единая цифровая платформа Колледжа Информационных Технологий. 
          Записывайтесь на спортивные секции, творческие кружки и пользуйтесь умной библиотекой 
          в один клик — без бумаг и очередей.
        </p>

        <div className="hero-actions">
          <button 
            className="btn btn-primary" 
            style={{ fontSize: '1.05rem', padding: '16px 36px' }}
            onClick={() => navigate('/sections')}
          >
            Смотреть секции
          </button>
          <button 
            className="btn btn-blue" 
            style={{ fontSize: '1.05rem', padding: '16px 36px' }}
            onClick={() => navigate('/clubs')}
          >
            Смотреть кружки
          </button>
          <button 
            className="btn btn-outline" 
            style={{ fontSize: '1.05rem', padding: '16px 36px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
            onClick={() => {
              if (sessionStorage.getItem('adminAuth') === 'true') navigate('/admin', { state: { tab: 'library' } });
              else navigate('/library');
            }}
          >
            <img src="/images/books.png" alt="Библиотека" style={{ width: '20px', height: '20px', objectFit: 'contain' }} /> Библиотека
          </button>
        </div>
      </section>

      {/* ===== О ПЛАТФОРМЕ ===== */}
      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="section-header">
          <div className="reveal">
            <span className="section-label section-label-orange">О платформе</span>
          </div>
          <h2 className="section-title reveal" style={{ transitionDelay: '0.1s' }}>
            <span className="text-gradient-mixed">Что такое ATC Leisure?</span>
          </h2>
          <p className="section-subtitle reveal" style={{ transitionDelay: '0.15s' }}>
            Цифровая экосистема для организации и управления внеучебной деятельностью 
            студентов Колледжа Информационных Технологий
          </p>
        </div>

        <div className="features-grid" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="feature-card reveal stagger-1" onClick={() => navigate('/sections')}>
            <div className="feature-icon feature-icon-orange">
              <img src="/images/basketball.png" alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.textContent = '🏀'; }} />
            </div>
            <h3 className="feature-title">Спортивные секции</h3>
            <p className="feature-text">
              Баскетбол, волейбол, футбол, настольный теннис и другие спортивные направления. 
              Тренировки проводятся под руководством опытных тренеров в спортзале колледжа.
            </p>
          </div>

          <div className="feature-card reveal stagger-2" onClick={() => navigate('/clubs')}>
            <div className="feature-icon feature-icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="0.5"/><circle cx="17.5" cy="10.5" r="0.5"/><circle cx="8.5" cy="7.5" r="0.5"/><circle cx="6.5" cy="12" r="0.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
            </div>
            <h3 className="feature-title">Творческие кружки</h3>
            <p className="feature-text">
              Робототехника, рисование, музыка, театральная студия и многое другое. 
              Развивай свои таланты и находи единомышленников среди студентов колледжа.
            </p>
          </div>

          <div className="feature-card reveal stagger-3" onClick={() => {
              if (sessionStorage.getItem('adminAuth') === 'true') navigate('/admin', { state: { tab: 'library' } });
              else navigate('/library');
            }}>
            <div className="feature-icon feature-icon-teal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <h3 className="feature-title">Умная библиотека</h3>
            <p className="feature-text">
              QR-система для учёта книг библиотеки колледжа. 
              Просто отсканируй код — и книга зарегистрирована за тобой. Быстро, удобно, без бумаг.
            </p>
          </div>
        </div>
      </section>

      {/* ===== СТАТИСТИКА ===== */}
      <section className="section">
        <div className="stats-grid">
          <div className="stat-card reveal stagger-1">
            <div className="stat-number" style={{ color: 'var(--color-orange)' }}>5+</div>
            <div className="stat-label">Спортивных секций</div>
          </div>
          <div className="stat-card reveal stagger-2">
            <div className="stat-number" style={{ color: 'var(--color-blue-light)' }}>4+</div>
            <div className="stat-label">Творческих кружков</div>
          </div>
          <div className="stat-card reveal stagger-3">
            <div className="stat-number" style={{ color: 'var(--color-accent)' }}>1.5с</div>
            <div className="stat-label">Время брони книги</div>
          </div>
          <div className="stat-card reveal stagger-4">
            <div className="stat-number" style={{ color: 'var(--color-orange-light)' }}>24/7</div>
            <div className="stat-label">Доступ к платформе</div>
          </div>
        </div>
      </section>

      {/* ===== КАК ЭТО РАБОТАЕТ ===== */}
      <section className="section">
        <div className="section-header">
          <div className="reveal">
            <span className="section-label section-label-blue">Как это работает</span>
          </div>
          <h2 className="section-title reveal" style={{ transitionDelay: '0.1s' }}>
            Три простых шага
          </h2>
          <p className="section-subtitle reveal" style={{ transitionDelay: '0.15s' }}>
            От выбора направления до первого занятия — всё онлайн
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card reveal stagger-1">
            <div className="step-number" style={{ background: 'rgba(232, 119, 34, 0.15)', color: 'var(--color-orange)' }}>1</div>
            <h3 className="step-title">Выбери направление</h3>
            <p className="step-text">Просмотри доступные секции и кружки. Изучи расписание, тренера и описание каждого направления.</p>
          </div>
          <div className="step-card reveal stagger-2">
            <div className="step-number" style={{ background: 'rgba(29, 93, 192, 0.15)', color: 'var(--color-blue-light)' }}>2</div>
            <h3 className="step-title">Заполни заявку</h3>
            <p className="step-text">Укажи свои данные: ФИО, группу, куратора и телефон. Заявка автоматически попадёт к преподавателю.</p>
          </div>
          <div className="step-card reveal stagger-3">
            <div className="step-number" style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--color-accent)' }}>3</div>
            <h3 className="step-title">Приходи на занятие</h3>
            <p className="step-text">После одобрения заявки — приходи по расписанию. Все данные хранятся в электронном журнале колледжа.</p>
          </div>
        </div>
      </section>

      {/* ===== ПРЕИМУЩЕСТВА ===== */}
      <section className="section">
        <div className="section-header">
          <div className="reveal">
            <span className="section-label section-label-orange">Преимущества</span>
          </div>
          <h2 className="section-title reveal" style={{ transitionDelay: '0.1s' }}>
            Почему <span className="text-gradient-orange">ATC Leisure</span>?
          </h2>
        </div>

        <div className="features-grid" style={{ maxWidth: '1100px', margin: '0 auto', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="feature-card reveal stagger-1" style={{ cursor: 'default' }}>
            <div className="feature-icon feature-icon-orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3 className="feature-title">Экономия времени</h3>
            <p className="feature-text">
              Никаких очередей к куратору и бумажных заявлений. 
              Запись на секцию или кружок занимает меньше минуты через платформу.
            </p>
          </div>

          <div className="feature-card reveal stagger-2" style={{ cursor: 'default' }}>
            <div className="feature-icon feature-icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="feature-title">Удобство для преподавателей</h3>
            <p className="feature-text">
              Электронный журнал записей, экспорт данных в Excel, 
              фильтрация по секциям и датам — всё под рукой в админ-панели.
            </p>
          </div>

          <div className="feature-card reveal stagger-3" style={{ cursor: 'default' }}>
            <div className="feature-icon feature-icon-teal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </div>
            <h3 className="feature-title">QR-система библиотеки</h3>
            <p className="feature-text">
              Генерация и сканирование QR-кодов для книг. 
              Преподаватель создаёт код, студент сканирует — учёт ведётся автоматически.
            </p>
          </div>

          <div className="feature-card reveal stagger-4" style={{ cursor: 'default' }}>
            <div className="feature-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="feature-title">Безопасность данных</h3>
            <p className="feature-text">
              Все данные студентов защищены и хранятся на серверах Supabase. 
              Доступ к админ-панели только по паролю преподавателя.
            </p>
          </div>
        </div>
      </section>

      {/* ===== НАПРАВЛЕНИЯ ===== */}
      <section className="section">
        <div className="section-header">
          <div className="reveal">
            <span className="section-label section-label-blue">Направления</span>
          </div>
          <h2 className="section-title reveal" style={{ transitionDelay: '0.1s' }}>
            Чем заняться в <span className="text-gradient-blue">колледже</span>?
          </h2>
          <p className="section-subtitle reveal" style={{ transitionDelay: '0.15s' }}>
            Более 9 направлений для активного развития студентов
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
              Спортивные секции
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: 'Баскетбол', desc: 'Командная игра — тренировки 3 раза в неделю', img: '/images/basketball.png' },
                { name: 'Футбол', desc: 'Мини-футбол для всех курсов', img: '/images/football.png' },
                { name: 'Волейбол', desc: 'Секция волейбола — сборная колледжа', img: '/images/volleyball.png' },
                { name: 'Настольный теннис', desc: 'Индивидуальные и парные игры', img: '/images/tennis.png' },
                { name: 'Шахматы', desc: 'Интеллектуальный спорт — турниры колледжа', img: '/images/chess.png' },
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
              Все секции →
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
              Творческие кружки
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: 'Робототехника', desc: 'Arduino, 3D-печать, программирование', img: '/images/robot.png' },
                { name: 'Рисование', desc: 'Живопись, графика, цифровое искусство', img: '/images/palette.png' },
                { name: 'Музыка', desc: 'Гитара, вокал, ритмическая секция', img: '/images/music.png' },
                { name: 'Театральная студия', desc: 'Актёрское мастерство, сценическая речь', img: '/images/teatr.png' },
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
              Все кружки →
            </button>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section" style={{ paddingBottom: '60px' }}>
        <div className="cta-section reveal-scale">
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '16px' }}>
            Готов <span className="text-gradient-orange">развиваться</span>? 
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Присоединяйся к внеучебной жизни Колледжа Информационных Технологий прямо сейчас
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '16px 36px' }} onClick={() => navigate('/sections')}>
              Начать
            </button>
            <button className="btn btn-outline" style={{ fontSize: '1.05rem', padding: '16px 36px' }} onClick={() => {
              if (sessionStorage.getItem('adminAuth') === 'true') navigate('/admin', { state: { tab: 'library' } });
              else navigate('/library');
            }}>
              Перейти в библиотеку
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;