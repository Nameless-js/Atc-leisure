import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

// Маппинг названий к изображениям
const getActivityImage = (title) => {
  if (!title) return null;
  const t = title.toLowerCase();
  if (t.includes('баскетбол')) return '/images/basketball.png';
  if (t.includes('футбол') || t.includes('soccer')) return '/images/football.png';
  if (t.includes('волейбол')) return '/images/volleyball.png';
  if (t.includes('теннис')) return '/images/tennis.png';
  if (t.includes('шахматы')) return '/images/chess.png';
  if (t.includes('робот')) return '/images/robot.png';
  if (t.includes('рисование') || t.includes('искусство')) return '/images/palette.png';
  if (t.includes('музыка') || t.includes('вокал')) return '/images/music.png';
  if (t.includes('театр')) return '/images/teatr.png';
  return null;
};

const Activities = ({ type }) => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const navigate = useNavigate();

  const isTeacher = sessionStorage.getItem('adminAuth') === 'true';
  const isSport = type === 'section';

  // Брендовые цвета АТК: оранжевый для спорта, синий для кружков
  const theme = {
    color: isSport ? '#E87722' : '#3B82F6',
    glow: isSport ? 'rgba(232, 119, 34, 0.12)' : 'rgba(59, 130, 246, 0.12)',
    borderHover: isSport ? 'rgba(232, 119, 34, 0.4)' : 'rgba(59, 130, 246, 0.4)',
    bgCard: isSport
      ? 'linear-gradient(145deg, rgba(12,20,40,0.6), rgba(232, 119, 34, 0.04))'
      : 'linear-gradient(145deg, rgba(12,20,40,0.6), rgba(59, 130, 246, 0.04))',
    title: isSport ? 'Спортивные Секции' : 'Творческие Кружки',
    subtitle: isSport
      ? (isTeacher ? 'Просмотр секций и записанных студентов' : 'Достигай новых рекордов вместе с командой')
      : (isTeacher ? 'Просмотр кружков и записанных студентов' : 'Раскрой свой творческий и интеллектуальный потенциал'),
    btnBg: isSport ? 'linear-gradient(135deg, #E87722, #C55E10)' : 'linear-gradient(135deg, #1D5DC0, #3B82F6)',
    btnHoverShadow: isSport ? '0 8px 25px rgba(232, 119, 34, 0.4)' : '0 8px 25px rgba(29, 93, 192, 0.4)',
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('type', type);

    if (data) setItems(data);
    if (error) console.error('Error fetching activities:', error);

    // Если учитель — загружаем записи студентов
    if (isTeacher) {
      const { data: regs } = await supabase
        .from('registrations')
        .select('*, activities:activity_id(title, type)')
        .order('created_at', { ascending: false });
      if (regs) setRegistrations(regs);
    }

    setLoading(false);
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  const getStudentsForActivity = (activityId) => {
    return registrations.filter(r => r.activity_id === activityId);
  };

  return (
    <div className="page-wrapper container" style={{ position: 'relative', zIndex: 1 }}>

      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px', background: theme.glow, filter: 'blur(100px)', borderRadius: '50%',
        zIndex: -1, pointerEvents: 'none'
      }} />

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: theme.color, marginBottom: '16px' }}>
          {theme.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
          {theme.subtitle}
        </p>
        {isTeacher && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginTop: '12px', padding: '6px 16px',
            background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)',
            borderRadius: '9999px', fontSize: '0.85rem', color: '#0ea5e9'
          }}>
            Режим преподавателя
          </div>
        )}
      </div>

      {/* Поиск */}
      <div style={{ maxWidth: '500px', margin: '0 auto 30px', position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Поиск по названию или описанию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderColor: 'rgba(255,255,255,0.08)',
            paddingLeft: '44px'
          }}
        />
        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem' }}>🔍</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${theme.color}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Ничего не найдено</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredItems.map((item, idx) => {
            const students = isTeacher ? getStudentsForActivity(item.id) : [];
            const img = getActivityImage(item.title);

            return (
              <div
                key={item.id}
                className="glass-card"
                style={{
                  display: 'flex', flexDirection: 'column',
                  background: theme.bgCard,
                  borderColor: 'rgba(255,255,255,0.05)',
                  transition: 'all 0.4s ease',
                  animation: `slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.08}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.borderHover;
                  e.currentTarget.style.transform = 'translateY(-6px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Картинка активности */}
                {img && (
                  <img
                    src={img}
                    alt={item.title}
                    className="activity-card-image"
                    style={{ animation: 'float 4s ease-in-out infinite' }}
                  />
                )}

                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>

                {item.description && (
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px', flex: isTeacher ? 0 : 1, lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                )}

                <div style={{ marginBottom: isTeacher ? '16px' : '24px', fontSize: '0.9rem', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <p style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: theme.color, marginRight: '10px', fontSize: '1rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{item.schedule || 'Уточняется'}</span>
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: theme.color, marginRight: '10px', fontSize: '1rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {item.mentor_name || 'Не назначен'} {item.mentor_phone ? <span style={{ opacity: 0.6 }}><br />{item.mentor_phone}</span> : ''}
                    </span>
                  </p>
                </div>

                {/* УЧИТЕЛЬ: Список записанных студентов */}
                {isTeacher ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: '10px'
                    }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Записанные студенты
                      </span>
                      <span style={{
                        fontSize: '0.8rem', fontWeight: 700,
                        padding: '3px 10px', borderRadius: '9999px',
                        background: students.length > 0 ? `${theme.color}22` : 'rgba(255,255,255,0.05)',
                        color: students.length > 0 ? theme.color : 'var(--text-muted)',
                      }}>
                        {students.length}
                      </span>
                    </div>

                    {students.length > 0 ? (
                      <div style={{
                        flex: 1, maxHeight: '200px', overflowY: 'auto',
                        background: 'rgba(0,0,0,0.15)', borderRadius: '10px',
                        padding: '8px',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        {students.map((s, sidx) => (
                          <div
                            key={s.id}
                            style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              background: sidx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = sidx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {/* Маленькая картинка мяча рядом с именем */}
                              {img && (
                                <img src={img} alt="" className="activity-card-image-sm" />
                              )}
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                  {s.student_name}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  {s.group_name || '—'}
                                </div>
                              </div>
                            </div>
                            <div style={{
                              fontSize: '0.75rem', color: 'var(--text-muted)',
                              textAlign: 'right'
                            }}>
                              {new Date(s.created_at).toLocaleDateString('ru-RU')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '24px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px',
                        border: '1px dashed rgba(255,255,255,0.08)',
                      }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Пока никто не записался</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* СТУДЕНТ: Кнопка записи */
                  <button
                    className="btn"
                    style={{
                      width: '100%', marginTop: 'auto',
                      background: theme.btnBg, color: 'white',
                      border: 'none', transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.boxShadow = theme.btnHoverShadow}
                    onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                    onClick={() => navigate('/register', { state: { selectedActivity: item.id } })}
                  >
                    Записаться
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Activities;