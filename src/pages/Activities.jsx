import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Activities = ({ type }) => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isSport = type === 'section';

  // Динамическая стилизация в зависимости от типа
  const theme = {
    color: isSport ? '#f97316' : '#a855f7', // Orange vs Purple
    glow: isSport ? 'rgba(249, 115, 22, 0.15)' : 'rgba(168, 85, 247, 0.15)',
    borderHover: isSport ? 'rgba(249, 115, 22, 0.4)' : 'rgba(168, 85, 247, 0.4)',
    bgCard: isSport ? 'linear-gradient(145deg, rgba(20,20,30,0.6), rgba(249, 115, 22, 0.05))' 
                    : 'linear-gradient(145deg, rgba(20,20,30,0.6), rgba(168, 85, 247, 0.05))',
    icon: isSport ? '⚽' : '🎨',
    title: isSport ? 'Спортивные Секции' : 'Творческие Кружки',
    subtitle: isSport ? 'Достигай новых рекордов вместе с командой' : 'Раскрой свой творческий и интеллектуальный потенциал',
    btnBg: isSport ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #a855f7, #9333ea)',
    btnHoverShadow: isSport ? '0 8px 25px rgba(249, 115, 22, 0.4)' : '0 8px 25px rgba(168, 85, 247, 0.4)',
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
    setLoading(false);
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-wrapper container" style={{ position: 'relative', zIndex: 1 }}>
      
      {/* Background ambient glow matching the theme */}
      <div style={{
        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px', background: theme.glow, filter: 'blur(100px)', borderRadius: '50%',
        zIndex: -1, pointerEvents: 'none'
      }} />

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: theme.color, marginBottom: '16px' }}>
          {theme.icon} {theme.title}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
          {theme.subtitle}
        </p>
      </div>

      <div className="search-bar-container" style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(20px)' }}>
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="form-input"
            placeholder="Поиск по названию или описанию..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.2)', 
              borderColor: 'rgba(255,255,255,0.05)'
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${theme.color}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px', opacity: 0.5 }}>{theme.icon}</span>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Ничего не найдено.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="glass-card" 
              style={{ 
                display: 'flex', flexDirection: 'column',
                background: theme.bgCard,
                borderColor: 'rgba(255,255,255,0.05)',
                transition: 'all 0.4s ease'
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
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
                {item.title}
              </h3>
              
              {item.description && (
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px', flex: 1, lineHeight: 1.6 }}>
                  {item.description}
                </p>
              )}
              
              <div style={{ marginBottom: '24px', fontSize: '0.9rem', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <p style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ color: theme.color, marginRight: '10px', fontSize: '1.2rem' }}>🕒</span> 
                  <span style={{ color: 'var(--text-primary)' }}>{item.schedule || 'Уточняется'}</span>
                </p>
                <p style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: theme.color, marginRight: '10px', fontSize: '1.2rem' }}>👨‍🏫</span> 
                  <span style={{ color: 'var(--text-primary)' }}>
                    {item.mentor_name || 'Не назначен'} {item.mentor_phone ? <span style={{opacity: 0.6}}><br/>{item.mentor_phone}</span> : ''}
                  </span>
                </p>
              </div>

              <button 
                className="btn" 
                style={{ 
                  width: '100%', marginTop: 'auto',
                  background: theme.btnBg, color: 'white',
                  border: 'none', transition: 'box-shadow 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.boxShadow = theme.btnHoverShadow}
                onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                onClick={() => navigate('/register', { state: { selectedActivity: item.id } })}
              >
                Записаться
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Activities;