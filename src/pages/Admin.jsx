import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { QRCodeSVG } from 'qrcode.react';
import XLSX from 'xlsx-js-style';

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Обновленные табы: 'sections', 'clubs', 'registrations', 'library'
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'sections');

  // Редактирование
  const [editingId, setEditingId] = useState(null);

  // Данные
  const [activities, setActivities] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [libraryRequests, setLibraryRequests] = useState([]);
  const [qrText, setQrText] = useState('');

  // Форма добавления/редактирования секции
  const [newSection, setNewSection] = useState({
    title: '', type: 'section', description: '', schedule: '', mentor_name: '', mentor_phone: '', image_url: ''
  });

  // Форма добавления/редактирования кружка
  const [newClub, setNewClub] = useState({
    title: '', type: 'club', description: '', schedule: '', mentor_name: '', mentor_phone: '', image_url: ''
  });

  // === ФИЛЬТРЫ ===
  const [filterActivity, setFilterActivity] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Все активности для dropdown в журнале
  const [allActivities, setAllActivities] = useState([]);

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
      if (activeTab === 'registrations') {
        fetchRegistrations();
        fetchAllActivities();
      }
      if (activeTab === 'library_history') {
        fetchLibraryRequests();
      }
    }
    // Сбрасываем фильтры при смене вкладки
    setFilterActivity('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') { 
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      window.dispatchEvent(new Event('authChange'));
      navigate('/');
    } else {
      alert('Неверный пароль');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const fetchActivities = async (type) => {
    // Получаем активности только выбранного типа
    const { data } = await supabase.from('activities').select('*').eq('type', type).order('created_at', { ascending: false });
    if (data) setActivities(data);
  };

  const fetchAllActivities = async () => {
    const { data } = await supabase.from('activities').select('id, title, type').order('title');
    if (data) setAllActivities(data);
  };

  const fetchRegistrations = async () => {
    const { data } = await supabase.from('registrations').select(`
      *,
      activities:activity_id(title)
    `).order('created_at', { ascending: false });
    if (data) setRegistrations(data);
  };

  const fetchLibraryRequests = async () => {
    const { data } = await supabase.from('library_requests').select('*').order('created_at', { ascending: false });
    if (data) setLibraryRequests(data);
  };

  const handleUpdateLibraryStatus = async (id, isReturned) => {
    const { error } = await supabase.from('library_requests').update({ is_returned: isReturned }).eq('id', id);
    if (!error) {
      fetchLibraryRequests();
    } else {
      alert('Ошибка обновления статуса: ' + error.message + '\n\nВнимание: Убедитесь, что в таблице library_requests есть колонка "is_returned" (с типом boolean).');
    }
  };

  const handleCreateActivity = async (e, isClub = false) => {
    e.preventDefault();
    const payload = isClub ? newClub : newSection;
    
    console.log(editingId ? "Обновляем данные:" : "Вставляем данные:", payload);

    let error, data;
    if (editingId) {
      const resp = await supabase.from('activities').update(payload).eq('id', editingId).select();
      error = resp.error;
      data = resp.data;
    } else {
      const resp = await supabase.from('activities').insert(payload).select();
      error = resp.error;
      data = resp.data;
    }
    
    if (!error) {
      alert(isClub ? (editingId ? 'Кружок обновлен!' : 'Кружок успешно добавлен!') : (editingId ? 'Секция обновлена!' : 'Секция успешно добавлена!'));
      setEditingId(null);
      if (isClub) {
        setNewClub({ title: '', type: 'club', description: '', schedule: '', mentor_name: '', mentor_phone: '', image_url: '' });
      } else {
        setNewSection({ title: '', type: 'section', description: '', schedule: '', mentor_name: '', mentor_phone: '', image_url: '' });
      }
      fetchActivities(isClub ? 'club' : 'section');
    } else {
      // Если ОШИБКА RLS или другая:
      console.error("Ошибка БД:", error);
      alert(`Ошибка БД!\nКод: ${error.code}\nТекст: ${error.message}\nЕсли RLS включено, отключите его или создайте Policy.`);
    }
  };

  const handleEditActivity = (activity, isClub) => {
    setEditingId(activity.id);
    if (isClub) {
      setNewClub({
        title: activity.title || '',
        type: 'club',
        description: activity.description || '',
        schedule: activity.schedule || '',
        mentor_name: activity.mentor_name || '',
        mentor_phone: activity.mentor_phone || '',
        image_url: activity.image_url || ''
      });
      setActiveTab('clubs');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setNewSection({
        title: activity.title || '',
        type: 'section',
        description: activity.description || '',
        schedule: activity.schedule || '',
        mentor_name: activity.mentor_name || '',
        mentor_phone: activity.mentor_phone || '',
        image_url: activity.image_url || ''
      });
      setActiveTab('sections');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cancelEdit = (isClub) => {
    setEditingId(null);
    if (isClub) setNewClub({ title: '', type: 'club', description: '', schedule: '', mentor_name: '', mentor_phone: '', image_url: '' });
    else setNewSection({ title: '', type: 'section', description: '', schedule: '', mentor_name: '', mentor_phone: '', image_url: '' });
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

  // === ФИЛЬТРАЦИЯ ДАННЫХ ===
  const applyDateFilter = (items, dateField = 'created_at') => {
    let filtered = [...items];
    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => new Date(item[dateField]) >= from);
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item[dateField]) <= to);
    }
    return filtered;
  };

  const filteredActivities = useMemo(() => {
    let filtered = [...activities];
    if (filterActivity !== 'all') {
      filtered = filtered.filter(a => a.title === filterActivity);
    }
    return applyDateFilter(filtered);
  }, [activities, filterActivity, filterDateFrom, filterDateTo]);

  const filteredRegistrations = useMemo(() => {
    let filtered = [...registrations];
    if (filterActivity !== 'all') {
      filtered = filtered.filter(r => r.activities?.title === filterActivity);
    }
    return applyDateFilter(filtered);
  }, [registrations, filterActivity, filterDateFrom, filterDateTo]);

  // === СТИЛИЗОВАННЫЙ ЭКСПОРТ В EXCEL ===
  const headerStyle = (color) => ({
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12, name: 'Arial' },
    fill: { fgColor: { rgb: color } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: '333333' } },
      bottom: { style: 'thin', color: { rgb: '333333' } },
      left: { style: 'thin', color: { rgb: '333333' } },
      right: { style: 'thin', color: { rgb: '333333' } },
    },
  });

  const cellStyle = (isEven) => ({
    font: { sz: 11, name: 'Arial', color: { rgb: '1a1a1a' } },
    fill: { fgColor: { rgb: isEven ? 'F2F2F2' : 'FFFFFF' } },
    alignment: { vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: 'D9D9D9' } },
      bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
      left: { style: 'thin', color: { rgb: 'D9D9D9' } },
      right: { style: 'thin', color: { rgb: 'D9D9D9' } },
    },
  });

  const titleStyle = {
    font: { bold: true, sz: 16, name: 'Arial', color: { rgb: '1a1a1a' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  };

  const subtitleStyle = {
    font: { italic: true, sz: 10, name: 'Arial', color: { rgb: '666666' } },
    alignment: { horizontal: 'left', vertical: 'center' },
  };

  const exportToExcel = (data, headerDefs, filename, sheetTitle, accentColor) => {
    if (data.length === 0) { alert('Нет данных для экспорта'); return; }

    const keys = Object.keys(headerDefs);
    const headerLabels = Object.values(headerDefs);

    // Формируем строку фильтра
    const filterParts = [];
    if (filterActivity !== 'all') filterParts.push(`Фильтр: ${filterActivity}`);
    if (filterDateFrom) filterParts.push(`С: ${new Date(filterDateFrom).toLocaleDateString('ru-RU')}`);
    if (filterDateTo) filterParts.push(`По: ${new Date(filterDateTo).toLocaleDateString('ru-RU')}`);
    const filterText = filterParts.length > 0 ? filterParts.join(' | ') : 'Все данные (без фильтров)';

    // Начинаем с пустого массива строк
    const wsData = [];

    // Строка 0: Заголовок документа
    const titleRow = [{ v: sheetTitle, s: titleStyle }];
    for (let i = 1; i < keys.length; i++) titleRow.push({ v: '', s: {} });
    wsData.push(titleRow);

    // Строка 1: Дата экспорта + фильтры
    const dateRow = [{ v: `Дата экспорта: ${new Date().toLocaleDateString('ru-RU')} | ${filterText}`, s: subtitleStyle }];
    for (let i = 1; i < keys.length; i++) dateRow.push({ v: '', s: {} });
    wsData.push(dateRow);

    // Строка 2: Пустая
    wsData.push([]);

    // Строка 3: Заголовки колонок
    const hdrRow = headerLabels.map(label => ({ v: label, s: headerStyle(accentColor) }));
    wsData.push(hdrRow);

    // Строки данных
    data.forEach((row, idx) => {
      const r = keys.map(key => ({
        v: row[key] !== null && row[key] !== undefined ? String(row[key]) : '',
        s: cellStyle(idx % 2 === 0),
      }));
      wsData.push(r);
    });

    // Строка итого
    wsData.push([]);
    const totalRow = [{ v: `Всего записей: ${data.length}`, s: { font: { bold: true, sz: 11, name: 'Arial', color: { rgb: '333333' } }, alignment: { horizontal: 'left' } } }];
    wsData.push(totalRow);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Мерж для заголовка и подзаголовка
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: keys.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: keys.length - 1 } },
    ];

    // Автоширина колонок
    ws['!cols'] = keys.map((key, i) => {
      const maxLen = Math.max(
        headerLabels[i].length,
        ...data.map(row => (row[key] ? String(row[key]).length : 0))
      );
      return { wch: Math.max(maxLen + 4, 14) };
    });

    // Высота строк
    ws['!rows'] = [
      { hpt: 32 },  // Заголовок
      { hpt: 20 },  // Подзаголовок
      { hpt: 10 },  // Пустая
      { hpt: 28 },  // Заголовки колонок
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Данные');
    XLSX.writeFile(wb, filename);
  };

  const handleExportSections = () => {
    const rows = filteredActivities.map(a => ({
      title: a.title,
      schedule: a.schedule || '',
      mentor_name: a.mentor_name || '',
      mentor_phone: a.mentor_phone || '',
      description: a.description || ''
    }));
    exportToExcel(rows, {
      title: 'Название',
      schedule: 'Расписание',
      mentor_name: 'Тренер',
      mentor_phone: 'Контакты',
      description: 'Описание'
    }, 'Спортивные_секции.xlsx', '🏀 Спортивные секции — КИТ', 'E87722');
  };

  const handleExportClubs = () => {
    const rows = filteredActivities.map(a => ({
      title: a.title,
      schedule: a.schedule || '',
      mentor_name: a.mentor_name || '',
      mentor_phone: a.mentor_phone || '',
      description: a.description || ''
    }));
    exportToExcel(rows, {
      title: 'Кружок',
      schedule: 'Встречи',
      mentor_name: 'Руководитель',
      mentor_phone: 'Контакты',
      description: 'Описание'
    }, 'Творческие_кружки.xlsx', '🎨 Творческие кружки — КИТ', '7B2D8B');
  };

  const handleExportRegistrations = () => {
    const rows = filteredRegistrations.map(r => ({
      student_name: r.student_name,
      group_name: r.group_name || '',
      activity: r.activities?.title || '—',
      date: new Date(r.created_at).toLocaleDateString('ru-RU')
    }));
    exportToExcel(rows, {
      student_name: 'Студент',
      group_name: 'Группа',
      activity: 'Выбранное направление',
      date: 'Дата записи'
    }, 'Журнал_записей.xlsx', '📋 Электронный журнал записей — КИТ', '0284C7');
  };

  // === СТИЛИ ФИЛЬТР-ПАНЕЛИ ===
  const filterPanelStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: '16px',
    padding: '20px 24px',
    marginBottom: '20px',
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 'var(--radius-md)',
    backdropFilter: 'blur(12px)',
  };

  const filterGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: '1 1 180px',
    minWidth: '150px',
  };

  const filterLabelStyle = {
    fontSize: '0.78rem',
    color: '#94a3b8',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const filterInputStyle = {
    padding: '10px 14px',
    background: '#0f172a',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    colorScheme: 'dark',
  };

  const exportBtnStyle = (color) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 22px',
    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
    border: 'none',
    borderRadius: '9999px',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: `0 4px 15px ${color}44`,
    whiteSpace: 'nowrap',
    alignSelf: 'flex-end',
  });

  const resetBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '9999px',
    color: '#94a3b8',
    fontWeight: 500,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    alignSelf: 'flex-end',
  };

  const hasFilters = filterActivity !== 'all' || filterDateFrom || filterDateTo;

  const handleResetFilters = () => {
    setFilterActivity('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  // === РЕНДЕР ФИЛЬТР-ПАНЕЛИ ===
  const renderFilterPanel = (type) => {
    const items = type === 'registrations' ? allActivities : activities;
    const labels = {
      sections: { select: 'Секция', color: '#E87722', handler: handleExportSections },
      clubs: { select: 'Кружок', color: '#9D4EDD', handler: handleExportClubs },
      registrations: { select: 'Направление', color: '#0284c7', handler: handleExportRegistrations },
    };
    const cfg = labels[type];
    const uniqueTitles = [...new Set(items.map(a => a.title))].sort();

    return (
      <div style={filterPanelStyle}>
        <div style={filterGroupStyle}>
          <label style={filterLabelStyle}>📌 {cfg.select}</label>
          <select 
            style={filterInputStyle} 
            value={filterActivity} 
            onChange={e => setFilterActivity(e.target.value)}
          >
            <option value="all">Все</option>
            {uniqueTitles.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={filterGroupStyle}>
          <label style={filterLabelStyle}>📅 Дата с</label>
          <input 
            type="date" 
            style={filterInputStyle} 
            value={filterDateFrom} 
            onChange={e => setFilterDateFrom(e.target.value)} 
          />
        </div>

        <div style={filterGroupStyle}>
          <label style={filterLabelStyle}>📅 Дата по</label>
          <input 
            type="date" 
            style={filterInputStyle} 
            value={filterDateTo} 
            onChange={e => setFilterDateTo(e.target.value)} 
          />
        </div>

        {hasFilters && (
          <button 
            style={resetBtnStyle} 
            onClick={handleResetFilters} 
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f8fafc'; }} 
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            ✕ Сбросить
          </button>
        )}

        <button 
          style={exportBtnStyle(cfg.color)} 
          onClick={cfg.handler}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 25px ${cfg.color}66`; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 15px ${cfg.color}44`; }}
        >
          📥 Экспорт в Excel
        </button>
      </div>
    );
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>← На главную</button>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>Выйти из аккаунта</button>
        </div>
      </div>

      <div className="tabs-container">
        <button className={`tab-button ${activeTab === 'sections' ? 'active' : ''}`} onClick={() => setActiveTab('sections')}>🏀 Спортивные Секции</button>
        <button className={`tab-button ${activeTab === 'clubs' ? 'active' : ''}`} onClick={() => setActiveTab('clubs')}>🎨 Творческие Кружки</button>
        <button className={`tab-button ${activeTab === 'registrations' ? 'active' : ''}`} onClick={() => setActiveTab('registrations')}>Электронный Журнал Записей</button>
        <button className={`tab-button ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>Библиотека (QR)</button>
        <button className={`tab-button ${activeTab === 'library_history' ? 'active' : ''}`} onClick={() => setActiveTab('library_history')}>📚 История Библиотеки</button>
      </div>

      {/* ВКЛАДКА: СЕКЦИИ */}
      {activeTab === 'sections' && (
        <div>
          {renderFilterPanel('sections')}

          <form className="glass-card" onSubmit={(e) => handleCreateActivity(e, false)} style={{ marginBottom: '30px', borderTop: '4px solid #E87722' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingId ? 'Редактирование Секции' : 'Регистрация Новой Секции'}</h3>
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
                <label className="form-label">Аватар карточки (URL-адрес картинки, необязательно)</label>
                <input className="form-input" placeholder="https://..." value={newSection.image_url} onChange={e => setNewSection({...newSection, image_url: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Краткое описание секции</label>
                <textarea className="form-input" value={newSection.description} onChange={e => setNewSection({...newSection, description: e.target.value})} rows="2" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ background: '#E87722', border: 'none', boxShadow: 'none' }}>
                {editingId ? 'Сохранить изменения' : 'Создать секцию'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline" onClick={() => cancelEdit(false)}>Отмена</button>
              )}
            </div>
          </form>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Название</th><th>Расписание</th><th>Тренер</th><th>Действия</th></tr></thead>
              <tbody>
                {filteredActivities.map(a => (
                  <tr key={a.id}>
                    <td style={{fontWeight: 'bold', color: '#E87722'}}>{a.title}</td>
                    <td>{a.schedule}</td>
                    <td>{a.mentor_name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleEditActivity(a, false)}>Изменить</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteActivity(a.id, false)}>Удалить</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredActivities.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>Нет созданных секций</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ВКЛАДКА: КРУЖКИ */}
      {activeTab === 'clubs' && (
        <div>
          {renderFilterPanel('clubs')}

          <form className="glass-card" onSubmit={(e) => handleCreateActivity(e, true)} style={{ marginBottom: '30px', borderTop: '4px solid #9D4EDD' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingId ? 'Редактирование Кружка' : 'Открытие Нового Кружка'}</h3>
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
                <label className="form-label">Аватар карточки (URL-адрес картинки, необязательно)</label>
                <input className="form-input" placeholder="https://..." value={newClub.image_url} onChange={e => setNewClub({...newClub, image_url: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Концепция кружка (описание)</label>
                <textarea className="form-input" value={newClub.description} onChange={e => setNewClub({...newClub, description: e.target.value})} rows="2" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ background: '#9D4EDD', border: 'none', boxShadow: 'none' }}>
                {editingId ? 'Сохранить изменения' : 'Создать кружок'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline" onClick={() => cancelEdit(true)}>Отмена</button>
              )}
            </div>
          </form>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Кружок</th><th>Встречи</th><th>Руководитель</th><th>Действия</th></tr></thead>
              <tbody>
                {filteredActivities.map(a => (
                  <tr key={a.id}>
                    <td style={{fontWeight: 'bold', color: '#9D4EDD'}}>{a.title}</td>
                    <td>{a.schedule}</td>
                    <td>{a.mentor_name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleEditActivity(a, true)}>Изменить</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteActivity(a.id, true)}>Удалить</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredActivities.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>Нет созданных кружков</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ВКЛАДКА: СТУДЕНТЫ */}
      {activeTab === 'registrations' && (
        <div>
          {renderFilterPanel('registrations')}

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
                {filteredRegistrations.map(r => (
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
                {filteredRegistrations.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center'}}>Нет данных</td></tr>}
              </tbody>
            </table>
          </div>
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

      {/* ВКЛАДКА: ИСТОРИЯ БИБЛИОТЕКИ */}
      {activeTab === 'library_history' && (
        <div className="glass-card" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>История выдачи книг</h3>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ФИО</th>
                  <th>Группа</th>
                  <th>Код Книги (Кол-во)</th>
                  <th>Дата и Время</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {libraryRequests.map(r => (
                  <tr key={r.id}>
                    <td style={{fontWeight: 'bold'}}>{r.student_name}</td>
                    <td>{r.group_name}</td>
                    <td>{r.book_id} {r.quantity > 1 ? `(${r.quantity} шт.)` : ''}</td>
                    <td>{new Date(r.created_at).toLocaleString('ru-RU')}</td>
                    <td>
                      {r.is_returned ? 
                        <span style={{background: 'rgba(0, 209, 178, 0.1)', color: '#00d1b2', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'}}>Возвращена</span> : 
                        <span style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'}}>На руках</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm" style={{ background: 'rgba(0, 209, 178, 0.2)', color: '#00d1b2', border: '1px solid rgba(0, 209, 178, 0.3)' }} onClick={() => handleUpdateLibraryStatus(r.id, true)}>Вернул</button>
                        <button className="btn btn-sm" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }} onClick={() => handleUpdateLibraryStatus(r.id, false)}>Отмена / На руках</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {libraryRequests.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center'}}>Нет записей о выдаче книг</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
