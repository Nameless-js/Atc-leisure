import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import * as XLSX from 'xlsx-js-style';
import { useLanguage } from '../context/LanguageContext';

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

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const isTeacher = sessionStorage.getItem('adminAuth') === 'true';

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Activity
    const { data: actData, error: actError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();

    if (actData) setActivity(actData);
    if (actError) console.error('Error fetching activity:', actError);

    // Fetch Registrations
    const { data: regData } = await supabase
      .from('registrations')
      .select('*')
      .eq('activity_id', id)
      .order('created_at', { ascending: false });
      
    if (regData) setStudents(regData);
    setLoading(false);
  };

  const handleExportExcel = () => {
    if (students.length === 0) { alert(t('ui.not_found')); return; }

    const wsData = [];
    
    // Заголовок
    wsData.push([{ v: `${t('details.student_list')}: ${activity?.title}`, s: { font: { bold: true, sz: 16 } } }]);
    wsData.push([]);
    
    // Колонки
    wsData.push([
      { v: t('register.student'), s: { font: { bold: true }, fill: { fgColor: { rgb: 'E2E8F0' } } } },
      { v: t('register.group'), s: { font: { bold: true }, fill: { fgColor: { rgb: 'E2E8F0' } } } },
      { v: t('admin.filter.date_from'), s: { font: { bold: true }, fill: { fgColor: { rgb: 'E2E8F0' } } } }
    ]);
    
    // Данные
    students.forEach(s => {
      wsData.push([
        { v: s.student_name },
        { v: s.group_name || '—' },
        { v: new Date(s.created_at).toLocaleDateString('ru-RU') }
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    // Автоширина
    ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('register.activity'));
    XLSX.writeFile(wb, `List_${activity?.title.replace(/\s+/g, '_')}.xlsx`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #E87722', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>{t('ui.not_found')}</h2>
        <button className="btn" onClick={() => navigate(-1)}>{t('ui.back')}</button>
      </div>
    );
  }

  const isSport = activity.type === 'section';
  const themeColor = isSport ? '#E87722' : '#3B82F6';
  const img = activity.image_url || getActivityImage(activity.title);
  const duration = "1.5 ч - 2 часа"; // Стандартное время (Mock)

  return (
    <div className="page-wrapper container" style={{ position: 'relative', zIndex: 1 }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        ← {t('ui.back')}
      </button>

      <div className="glass-card" style={{ 
        padding: '30px', 
        borderTop: `4px solid ${themeColor}`,
        background: 'linear-gradient(145deg, rgba(12,20,40,0.8), rgba(0,0,0,0.4))'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
          
          {/* Левая колонка: Изображение */}
          {img && (
            <div style={{ 
              flex: '0 0 150px', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '20px', 
              padding: '20px', 
              display: 'flex', 
              justifyContent: 'center',
              boxShadow: `0 10px 30px ${themeColor}33`
            }}>
              <img src={img} alt={activity.title} style={{ width: '100%', objectFit: 'contain', animation: 'float 4s ease-in-out infinite' }} />
            </div>
          )}

          {/* Правая колонка: Информация об активности */}
          <div style={{ flex: '1 1 300px' }}>
            <h1 style={{ fontSize: '2.5rem', color: themeColor, marginBottom: '10px' }}>{activity.title}</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: '1.6' }}>
              {activity.description || t('ui.not_found')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '5px' }}>{t('details.schedule')}</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{activity.schedule || t('ui.not_found')}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '5px' }}>{t('details.duration')}</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{duration}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '5px' }}>{t('details.mentor')}</div>
                <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{activity.mentor_name || t('ui.not_found')}</div>
                {activity.mentor_phone && <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{activity.mentor_phone}</div>}
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '5px' }}>{t('details.participants')}</div>
                <div style={{ fontSize: '1.5rem', color: themeColor, fontWeight: 'bold' }}>{students.length}</div>
              </div>
            </div>

            {!isTeacher && (
              <button 
                className="btn" 
                style={{
                  background: isSport ? 'linear-gradient(135deg, #E87722, #C55E10)' : 'linear-gradient(135deg, #1D5DC0, #3B82F6)', 
                  color: 'white', 
                  padding: '14px 30px', 
                  fontSize: '1.1rem',
                  boxShadow: isSport ? '0 8px 25px rgba(232, 119, 34, 0.4)' : '0 8px 25px rgba(29, 93, 192, 0.4)'
                }}
                onClick={() => navigate('/register', { state: { selectedActivity: activity.id } })}
              >
                {t('ui.register')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Блок преподавателя (Список студентов) */}
      {isTeacher && (
        <div className="glass-card" style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h3 style={{ margin: 0 }}>{t('details.student_list')}</h3>
            <button 
              className="btn btn-outline"
              onClick={handleExportExcel}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              📥 {t('ui.export_excel')}
            </button>
          </div>

          {students.length > 0 ? (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('register.student')}</th>
                    <th>{t('register.group')}</th>
                    <th>{t('admin.filter.date_from')}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 'bold' }}>{s.student_name}</td>
                      <td>{s.group_name || '—'}</td>
                      <td>{new Date(s.created_at).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}>
              <p style={{ color: 'var(--text-muted)' }}>{t('details.empty_students')}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ActivityDetail;
