import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { QRCodeSVG } from 'qrcode.react';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Обновленные табы: 'sections', 'clubs', 'registrations', 'library'
  const [activeTab, setActiveTab] = useState('sections');

  // Данные
  const [activities, setActivities] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [qrText, setQrText] = useState('');

  // Форма добавления секции
  const [newSection, setNewSection] = useState({
    title: '', type: 'section', description: '', schedule: '', mentor_name: '', mentor_phone: ''
  });

  // Форма добавления кружка
  const [newClub, setNewClub] = useState({
    title: '', type: 'club', description: '', schedule: '', mentor_name: '', mentor_phone: ''
  });

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'sections' || activeTab === 'clubs') {
        fetchActivities(activeTab === 'sections' ? 'section' : 'club');
      }
      if (activeTab === 'registrations') fetchRegistrations();
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') { 
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      alert('Неверный пароль');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
  };

  const fetchActivities = async (type) => {
    // Получаем активности только выбранного типа
    const { data } = await supabase.from('activities').select('*').eq('type', type).order('created_at', { ascending: false });
    if (data) setActivities(data);
  };

  const fetchRegistrations = async () => {
    const { data } = await supabase.from('registrations').select(`
      *,
      activities:activity_id(title)
    `).order('created_at', { ascending: false });
    if (data) setRegistrations(data);
  };

  const handleCreateActivity = async (e, isClub = false) => {
    e.preventDefault();
    const payload = isClub ? newClub : newSection;
    
    console.log("Вставляем данные:", payload);

    // ФИКС сохранности: передаем payload напрямую (не массивом) - supabase ^2.x поддерживает оба варианта, но так безопаснее 
    // Также выводим точный текст ошибки если есть
    const { data, error } = await supabase.from('activities').insert(payload).select();
    
    if (!error) {
      alert(isClub ? 'Кружок успешно добавлен!' : 'Секция успешно добавлена!');
      if (isClub) {
        setNewClub({ title: '', type: 'club', description: '', schedule: '', mentor_name: '', mentor_phone: '' });
      } else {
        setNewSection({ title: '', type: 'section', description: '', schedule: '', mentor_name: '', mentor_phone: '' });
      }
      fetchActivities(isClub ? 'club' : 'section');
    } else {
      // Если ОШИБКА RLS или другая:
      console.error("Ошибка вставки БД:", error);
      alert(`Ошибка БД!\nКод: ${error.code}\nТекст: ${error.message}\nЕсли RLS включено, отключите его или создайте Policy.`);
    }
  };

  const handleDeleteActivity = async (id, isClub) => {
    if(!window.confirm('Точно удалить?')) return;
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (!error) {
      fetchActivities(isClub ? 'club' : 'section');
    } else {
      alert(`Ошибка удаления:\n${error.message}`);
    }
  };

  const handleDeleteRegistration = async (id) => {
    if(!window.confirm('Точно удалить запись студента?')) return;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (!error) fetchRegistrations();
  };

  if (!isAuthenticated) {
    return (
      <div className="page-wrapper container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <form onSubmit={handleLogin} className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Вход для персонала</h2>
          <div className="form-group">
            <label className="form-label">Пароль (demo: admin123)</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Войти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="page-wrapper container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Панель управления</h2>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>Выйти</button>
      </div>

      <div className="tabs-container">
        <button className={`tab-button ${activeTab === 'sections' ? 'active' : ''}`} onClick={() => setActiveTab('sections')}>🏀 Спортивные Секции</button>
        <button className={`tab-button ${activeTab === 'clubs' ? 'active' : ''}`} onClick={() => setActiveTab('clubs')}>🎨 Творческие Кружки</button>
        <button className={`tab-button ${activeTab === 'registrations' ? 'active' : ''}`} onClick={() => setActiveTab('registrations')}>Электронный Журнал Записей</button>
        <button className={`tab-button ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>Библиотека (QR)</button>
      </div>

      {/* ВКЛАДКА: СЕКЦИИ */}
      {activeTab === 'sections' && (
        <div>
          <form className="glass-card" onSubmit={(e) => handleCreateActivity(e, false)} style={{ marginBottom: '30px', borderTop: '4px solid #E87722' }}>
            <h3 style={{ marginBottom: '20px' }}>Регистрация Новой Секции</h3>
            <div className="cards-grid">
              <div className="form-group">
                <label className="form-label">Название секции (например, Волейбол)</label>
                <input required className="form-input" value={newSection.title} onChange={e => setNewSection({...newSection, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Дни проведения и время</label>
                <input className="form-input" placeholder="Пн, Ср, Пт 18:00" value={newSection.schedule} onChange={e => setNewSection({...newSection, schedule: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Тренер (ФИО)</label>
                <input className="form-input" value={newSection.mentor_name} onChange={e => setNewSection({...newSection, mentor_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Контакты тренера</label>
                <input className="form-input" value={newSection.mentor_phone} onChange={e => setNewSection({...newSection, mentor_phone: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Краткое описание секции</label>
                <textarea className="form-input" value={newSection.description} onChange={e => setNewSection({...newSection, description: e.target.value})} rows="2" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', background: '#E87722', border: 'none', boxShadow: 'none' }}>Создать секцию</button>
          </form>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Название</th><th>Расписание</th><th>Тренер</th><th>Действия</th></tr></thead>
              <tbody>
                {activities.map(a => (
                  <tr key={a.id}>
                    <td style={{fontWeight: 'bold', color: '#E87722'}}>{a.title}</td>
                    <td>{a.schedule}</td>
                    <td>{a.mentor_name}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteActivity(a.id, false)}>Удалить</button></td>
                  </tr>
                ))}
                {activities.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>Нет созданных секций</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ВКЛАДКА: КРУЖКИ */}
      {activeTab === 'clubs' && (
        <div>
          <form className="glass-card" onSubmit={(e) => handleCreateActivity(e, true)} style={{ marginBottom: '30px', borderTop: '4px solid #9D4EDD' }}>
            <h3 style={{ marginBottom: '20px' }}>Открытие Нового Кружка</h3>
            <div className="cards-grid">
              <div className="form-group">
                <label className="form-label">Название кружка (например, Робототехника)</label>
                <input required className="form-input" value={newClub.title} onChange={e => setNewClub({...newClub, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Дни встреч</label>
                <input className="form-input" placeholder="Вторник, Четверг 16:30" value={newClub.schedule} onChange={e => setNewClub({...newClub, schedule: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Руководитель (ФИО)</label>
                <input className="form-input" value={newClub.mentor_name} onChange={e => setNewClub({...newClub, mentor_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Контакты руководителя</label>
                <input className="form-input" value={newClub.mentor_phone} onChange={e => setNewClub({...newClub, mentor_phone: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Концепция кружка (описание)</label>
                <textarea className="form-input" value={newClub.description} onChange={e => setNewClub({...newClub, description: e.target.value})} rows="2" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', background: '#9D4EDD', border: 'none', boxShadow: 'none' }}>Создать кружок</button>
          </form>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Кружок</th><th>Встречи</th><th>Руководитель</th><th>Действия</th></tr></thead>
              <tbody>
                {activities.map(a => (
                  <tr key={a.id}>
                    <td style={{fontWeight: 'bold', color: '#9D4EDD'}}>{a.title}</td>
                    <td>{a.schedule}</td>
                    <td>{a.mentor_name}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDeleteActivity(a.id, true)}>Удалить</button></td>
                  </tr>
                ))}
                {activities.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>Нет созданных кружков</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ВКЛАДКА: СТУДЕНТЫ */}
      {activeTab === 'registrations' && (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Студент</th>
                <th>Группа</th>
                <th>Выбранное Направление</th>
                <th>Дата записи</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(r => (
                <tr key={r.id}>
                  <td style={{fontWeight: 'bold'}}>{r.student_name}</td>
                  <td>{r.group_name}</td>
                  <td><span style={{background: 'rgba(0, 209, 178, 0.1)', color: '#00d1b2', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'}}>{r.activities?.title || '—'}</span></td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRegistration(r.id)}>Исключить</button>
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center'}}>Нет данных</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ВКЛАДКА: БИБЛИОТЕКА И QR */}
      {activeTab === 'library' && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px' }}>Библиотека: Генератор QR</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Превратите код книги в QR для наклейки. Студенты сканируют такие наклейки на главной странице в 1 клик.
          </p>
          <div className="form-group" style={{ maxWidth: '400px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Например: ISBN-978-0132350884" 
              value={qrText}
              onChange={e => setQrText(e.target.value)}
            />
          </div>
          
          {qrText && (
            <div className="qr-container">
              <QRCodeSVG value={qrText} size={220} level="Q" includeMargin={true} />
              <p style={{ marginTop: '16px', fontWeight: 'bold', color: '#1a1a1a', letterSpacing: '2px' }}>{qrText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
