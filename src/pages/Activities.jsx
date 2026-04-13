import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();

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
    title: isSport ? t('dir.sec.title') : t('dir.club.title'),
    subtitle: isSport
      ? (isTeacher ? t('nav.teacher') : t('home.feat1.text').split('.')[0])
      : (isTeacher ? t('nav.teacher') : t('home.feat2.text').split('.')[0]),
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

    // Если учитель — загружаем записи студентов для счетчика на карточке (или убираем)
    // Мы можем убрать загрузку записей, так как детали теперь в ActivityDetail
    // Но оставим, если хотим выводить количество
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
            {t('nav.teacher')}
          </div>
        )}
      </div>

      {/* Поиск */}
      <div style={{ maxWidth: '500px', margin: '0 auto 30px', position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          placeholder={isSport ? t('act.search.sec') : t('act.search.club')}
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{isSport ? t('act.empty.sec') : t('act.empty.club')}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredItems.map((item, idx) => {
            const students = isTeacher ? getStudentsForActivity(item.id) : [];
            const img = item.image_url || getActivityImage(item.title);

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
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => navigate(`/activity/${item.id}`)}
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
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px', flex: 1, lineHeight: 1.6 }}>
                    {item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description}
                  </p>
                )}

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        color: theme.color,
                        border: `1px solid ${theme.borderHover}`,
                        fontWeight: '500'
                    }}>
                        {t('ui.details')} →
                    </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Activities;