import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { QRCodeSVG } from 'qrcode.react';
import XLSX from 'xlsx-js-style';
import { useLanguage } from '../context/LanguageContext';

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const { t, language } = useLanguage();
  
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
      alert(t('ui.not_found'));
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
      alert(isClub ? (editingId ? t('admin.form.update') : t('msg.success.register')) : (editingId ? t('admin.form.update') : t('msg.success.register')));
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
    if(!window.confirm(t('ui.confirm_delete'))) return;
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (!error) {
      fetchActivities(isClub ? 'club' : 'section');
    } else {
      alert(`Ошибка удаления:\n${error.message}`);
    }
  };

  const handleDeleteRegistration = async (id) => {
    if(!window.confirm(t('ui.confirm_delete'))) return;
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

  const filteredLibraryRequests = useMemo(() => {
    let filtered = [...libraryRequests];
    if (filterActivity !== 'all') {
      filtered = filtered.filter(r => r.book_id === filterActivity || r.book_name === filterActivity);
    }
    return applyDateFilter(filtered);
  }, [libraryRequests, filterActivity, filterDateFrom, filterDateTo]);

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
    if (data.length === 0) { alert(t('ui.not_found')); return; }

    const keys = Object.keys(headerDefs);
    const headerLabels = Object.values(headerDefs);

    // Формируем строку фильтра
    const filterParts = [];
    if (filterActivity !== 'all') filterParts.push(`${t('admin.filter.activity')}: ${filterActivity}`);
    if (filterDateFrom) filterParts.push(`${t('admin.filter.date_from')}: ${new Date(filterDateFrom).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}`);
    if (filterDateTo) filterParts.push(`${t('admin.filter.date_to')}: ${new Date(filterDateTo).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}`);
    const filterText = filterParts.length > 0 ? filterParts.join(' | ') : t('admin.filter.all');

    // Начинаем с пустого массива строк
    const wsData = [];

    // Строка 0: Заголовок документа
    const titleRow = [{ v: sheetTitle, s: titleStyle }];
    for (let i = 1; i < keys.length; i++) titleRow.push({ v: '', s: {} });
    wsData.push(titleRow);

    // Строка 1: Дата экспорта + фильтры
    const dateRow = [{ v: `${t('admin.filter.date_from')}: ${new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')} | ${filterText}`, s: subtitleStyle }];
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
    const totalRow = [{ v: `${t('details.participants')}: ${data.length}`, s: { font: { bold: true, sz: 11, name: 'Arial', color: { rgb: '333333' } }, alignment: { horizontal: 'left' } } }];
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
      title: t('admin.form.title'),
      schedule: t('admin.form.schedule'),
      mentor_name: t('admin.form.mentor'),
      mentor_phone: t('admin.form.phone'),
      description: t('admin.form.description')
    }, `Sections_${language}.xlsx`, `${t('admin.tab.sections')} — ATC`, 'E87722');
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
      title: t('admin.form.title'),
      schedule: t('admin.form.schedule'),
      mentor_name: t('admin.form.mentor'),
      mentor_phone: t('admin.form.phone'),
      description: t('admin.form.description')
    }, `Clubs_${language}.xlsx`, `${t('admin.tab.clubs')} — ATC`, '7B2D8B');
  };

  const handleExportRegistrations = () => {
    const rows = filteredRegistrations.map(r => ({
      student_name: r.student_name,
      group_name: r.group_name || '',
      activity: r.activities?.title || '—',
      date: new Date(r.created_at).toLocaleDateString('ru-RU')
    }));
    exportToExcel(rows, {
      student_name: t('register.student'),
      group_name: t('register.group'),
      activity: t('admin.filter.activity'),
      date: t('admin.filter.date_from')
    }, `Journal_${language}.xlsx`, `${t('admin.tab.journal')} — ATC`, '0284C7');
  };

  const handleExportLibrary = () => {
    const rows = filteredLibraryRequests.map(r => ({
      student_name: r.student_name,
      group_name: r.group_name || '',
      book_name: r.book_name || '',
      book_id: r.book_id || '',
      quantity: r.quantity || 1,
      date: new Date(r.created_at).toLocaleString('ru-RU'),
      status: r.is_returned ? 'Возвращена' : 'На руках'
    }));
    exportToExcel(rows, {
      student_name: t('register.student'),
      group_name: t('register.group'),
      book_name: t('library.form.bookName'),
      book_id: t('library.form.bookId'),
      quantity: t('library.form.quantity'),
      date: t('admin.filter.date_from'),
      status: t('admin.filter.status')
    }, `Library_History_${language}.xlsx`, `${t('admin.tab.library_history')} — ATC`, '10b981');
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
    let items = activities;
    if (type === 'registrations') items = allActivities;
    else if (type === 'library_history') items = libraryRequests.map(r => ({title: r.book_name || r.book_id}));
    
    const labels = {
      sections: { select: 'Секция', color: '#E87722', handler: handleExportSections },
      clubs: { select: 'Кружок', color: '#9D4EDD', handler: handleExportClubs },
      registrations: { select: 'Направление', color: '#0284c7', handler: handleExportRegistrations },
      library_history: { select: 'Название / Код книги', color: '#10b981', handler: handleExportLibrary },
    };
    const cfg = labels[type];
    const uniqueTitles = [...new Set(items.map(a => a.title).filter(Boolean))].sort();

    return (
      <div style={filterPanelStyle}>
        <div style={filterGroupStyle}>
          <label style={filterLabelStyle}>📌 {cfg.select}</label>
          <select 
            style={filterInputStyle} 
            value={filterActivity} 
            onChange={e => setFilterActivity(e.target.value)}
          >
            <option value="all">{t('admin.filter.all')}</option>
            {uniqueTitles.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={filterGroupStyle}>
          <label style={filterLabelStyle}>📅 {t('admin.filter.date_from')}</label>
          <input 
            type="date" 
            style={filterInputStyle} 
            value={filterDateFrom} 
            onChange={e => setFilterDateFrom(e.target.value)} 
          />
        </div>

        <div style={filterGroupStyle}>
          <label style={filterLabelStyle}>📅 {t('admin.filter.date_to')}</label>
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
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>{t('admin.login_title')}</h2>
          <div className="form-group">
            <label className="form-label">{t('admin.password_label')}</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('admin.login_btn')}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="page-wrapper container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>{t('admin.title')}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>← {t('nav.main')}</button>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>{t('admin.logout_btn')}</button>
        </div>
      </div>

      <div className="tabs-container">
        <button className={`tab-button ${activeTab === 'sections' ? 'active' : ''}`} onClick={() => setActiveTab('sections')}>{t('admin.tab.sections')}</button>
        <button className={`tab-button ${activeTab === 'clubs' ? 'active' : ''}`} onClick={() => setActiveTab('clubs')}>{t('admin.tab.clubs')}</button>
        <button className={`tab-button ${activeTab === 'registrations' ? 'active' : ''}`} onClick={() => setActiveTab('registrations')}>{t('admin.tab.journal')}</button>
        <button className={`tab-button ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>{t('admin.tab.library')}</button>
        <button className={`tab-button ${activeTab === 'library_history' ? 'active' : ''}`} onClick={() => setActiveTab('library_history')}>{t('admin.tab.library_history')}</button>
      </div>

      {/* ВКЛАДКА: СЕКЦИИ */}
      {activeTab === 'sections' && (
        <div>
          {renderFilterPanel('sections')}

          <form className="glass-card" onSubmit={(e) => handleCreateActivity(e, false)} style={{ marginBottom: '30px', borderTop: '4px solid #E87722' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingId ? t('admin.form.update') : t('admin.form.create')}</h3>
            <div className="cards-grid">
              <div className="form-group">
                <label className="form-label">{t('admin.form.title')}</label>
                <input required className="form-input" value={newSection.title} onChange={e => setNewSection({...newSection, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.form.schedule')}</label>
                <input className="form-input" placeholder="Пн, Ср, Пт 18:00" value={newSection.schedule} onChange={e => setNewSection({...newSection, schedule: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.form.mentor')}</label>
                <input className="form-input" value={newSection.mentor_name} onChange={e => setNewSection({...newSection, mentor_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.form.phone')}</label>
                <input className="form-input" value={newSection.mentor_phone} onChange={e => setNewSection({...newSection, mentor_phone: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">{t('admin.form.image')}</label>
                <input className="form-input" placeholder="https://..." value={newSection.image_url} onChange={e => setNewSection({...newSection, image_url: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">{t('admin.form.description')}</label>
                <textarea className="form-input" value={newSection.description} onChange={e => setNewSection({...newSection, description: e.target.value})} rows="2" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ background: '#E87722', border: 'none', boxShadow: 'none' }}>
                {editingId ? t('ui.save') : t('admin.form.create')}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline" onClick={() => cancelEdit(false)}>{t('ui.cancel')}</button>
              )}
            </div>
          </form>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead><tr><th>{t('admin.form.title')}</th><th>{t('admin.form.schedule')}</th><th>{t('admin.form.mentor')}</th><th>{t('ui.edit')}</th></tr></thead>
              <tbody>
                {filteredActivities.map(a => (
                  <tr key={a.id}>
                    <td style={{fontWeight: 'bold', color: '#E87722'}}>{a.title}</td>
                    <td>{a.schedule}</td>
                    <td>{a.mentor_name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleEditActivity(a, false)}>{t('ui.edit')}</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteActivity(a.id, false)}>{t('ui.delete')}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredActivities.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>{t('ui.not_found')}</td></tr>}
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
            <h3 style={{ marginBottom: '20px' }}>{editingId ? t('admin.form.update') : t('admin.form.create')}</h3>
            <div className="cards-grid">
              <div className="form-group">
                <label className="form-label">{t('admin.form.title')}</label>
                <input required className="form-input" value={newClub.title} onChange={e => setNewClub({...newClub, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.form.schedule')}</label>
                <input className="form-input" placeholder="Вторник, Четверг 16:30" value={newClub.schedule} onChange={e => setNewClub({...newClub, schedule: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.form.mentor')}</label>
                <input className="form-input" value={newClub.mentor_name} onChange={e => setNewClub({...newClub, mentor_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.form.phone')}</label>
                <input className="form-input" value={newClub.mentor_phone} onChange={e => setNewClub({...newClub, mentor_phone: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">{t('admin.form.image')}</label>
                <input className="form-input" placeholder="https://..." value={newClub.image_url} onChange={e => setNewClub({...newClub, image_url: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">{t('admin.form.description')}</label>
                <textarea className="form-input" value={newClub.description} onChange={e => setNewClub({...newClub, description: e.target.value})} rows="2" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ background: '#9D4EDD', border: 'none', boxShadow: 'none' }}>
                {editingId ? t('ui.save') : t('admin.form.create')}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline" onClick={() => cancelEdit(true)}>{t('ui.cancel')}</button>
              )}
            </div>
          </form>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead><tr><th>{t('admin.tab.clubs')}</th><th>{t('admin.form.schedule')}</th><th>{t('admin.form.mentor')}</th><th>{t('ui.edit')}</th></tr></thead>
              <tbody>
                {filteredActivities.map(a => (
                  <tr key={a.id}>
                    <td style={{fontWeight: 'bold', color: '#9D4EDD'}}>{a.title}</td>
                    <td>{a.schedule}</td>
                    <td>{a.mentor_name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleEditActivity(a, true)}>{t('ui.edit')}</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteActivity(a.id, true)}>{t('ui.delete')}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredActivities.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>{t('ui.not_found')}</td></tr>}
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
                  <th>{t('register.student')}</th>
                  <th>{t('register.group')}</th>
                  <th>{t('admin.filter.activity')}</th>
                  <th>{t('admin.filter.date_from')}</th>
                  <th>{t('ui.delete')}</th>
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
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRegistration(r.id)}>{t('ui.delete')}</button>
                    </td>
                  </tr>
                ))}
                {filteredRegistrations.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center'}}>{t('ui.not_found')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ВКЛАДКА: БИБЛИОТЕКА И QR */}
      {activeTab === 'library' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px' }}>{t('admin.tab.library')}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Превратите код книги в QR для наклейки. Учащиеся сканируют такие наклейки, оформляя конкретную книгу.
            </p>
            <div className="form-group" style={{ maxWidth: '100%' }}>
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
                <p style={{ marginTop: '16px', fontWeight: 'bold', color: '#1a1a1a', letterSpacing: '2px', wordBreak: 'break-all' }}>{qrText}</p>
              </div>
            )}
          </div>
          
          <div className="glass-card">
             <h3 style={{ marginBottom: '20px' }}>QR {t('nav.teacher')}</h3>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
               Распечатайте этот QR для сканера на входе или кафедре. Он ведет на главную страницу библиотеки со сканером.
             </p>
             <div className="qr-container">
                <QRCodeSVG value={window.location.origin + '/library'} size={220} level="Q" includeMargin={true} />
                <p style={{ marginTop: '16px', fontWeight: 'bold', color: '#1a1a1a', letterSpacing: '1px' }}>{t('library.scanner.title')}</p>
             </div>
          </div>
        </div>
      )}

      {/* ВКЛАДКА: ИСТОРИЯ БИБЛИОТЕКИ */}
      {activeTab === 'library_history' && (
        <div>
          {renderFilterPanel('library_history')}
          
          <div className="glass-card" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>{t('admin.tab.library_history')}</h3>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t('register.student')}</th>
                    <th>{t('register.group')}</th>
                    <th>{t('library.form.bookName')} / {t('library.form.bookId')}</th>
                    <th>{t('library.form.quantity')}</th>
                    <th>{t('admin.filter.date_from')}</th>
                    <th>{t('admin.filter.status')}</th>
                    <th>{t('ui.edit')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLibraryRequests.map(r => (
                    <tr key={r.id}>
                      <td style={{fontWeight: 'bold'}}>{r.student_name}</td>
                      <td>{r.group_name}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '500' }}>{r.book_name || 'Без названия'}</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.book_id}</span>
                        </div>
                      </td>
                      <td>{r.quantity}</td>
                      <td>{new Date(r.created_at).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}</td>
                      <td>
                        {r.is_returned ? 
                          <span style={{background: 'rgba(0, 209, 178, 0.1)', color: '#00d1b2', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'}}>{t('admin.status.returned')}</span> : 
                          <span style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'}}>{t('admin.status.on_hand')}</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-sm" style={{ background: 'rgba(0, 209, 178, 0.2)', color: '#00d1b2', border: '1px solid rgba(0, 209, 178, 0.3)' }} onClick={() => handleUpdateLibraryStatus(r.id, true)}>{t('admin.action.return')}</button>
                          <button className="btn btn-sm" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }} onClick={() => handleUpdateLibraryStatus(r.id, false)}>{t('ui.cancel')}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLibraryRequests.length === 0 && <tr><td colSpan="7" style={{textAlign: 'center'}}>{t('ui.not_found')}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
