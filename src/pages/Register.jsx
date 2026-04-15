import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [activities, setActivities] = useState([]);
  const [formData, setFormData] = useState({
    student_name: '',
    group_name: '',
    curator_name: '',
    phone: '',
    activity_id: location.state?.selectedActivity || ''
  });
  const [loading, setLoading] = useState(false);

  // Загружаем список кружков/секций для выпадающего списка
  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase.from('activities').select('id, title, type');
      if (data) {
        let filteredData = data;
        // Если перешли с конкретной секции/кружка, узнаем ее тип
        const selectedId = location.state?.selectedActivity;
        if (selectedId) {
          const selectedAct = data.find(a => a.id === selectedId);
          if (selectedAct) {
            filteredData = data.filter(a => a.type === selectedAct.type);
          }
        }
        setActivities(filteredData);
      }
      if (error) console.error('Error fetching activities:', error);
    };
    fetchActivities();
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('registrations')
      .insert(formData);

    setLoading(false);

    if (error) {
      alert(t('ui.not_found'));
      console.error(error);
    } else {
      alert(t('msg.success.register'));
      navigate('/'); // Возвращаем на главную
    }
  };

  return (
    <div className="page-wrapper reveal visible" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 72px)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 className="section-title" style={{ fontSize: '2rem' }}>
            <span className="text-gradient-orange">{t('register.title')}</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '0.95rem' }}>{t('register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('register.student')}</label>
            <input className="form-input" name="student_name" placeholder="Иванов Иван Иванович" required value={formData.student_name || ''} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('register.group')}</label>
            <input className="form-input" name="group_name" placeholder="напр. ИС-202" required value={formData.group_name || ''} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('register.curator')}</label>
            <input className="form-input" name="curator_name" placeholder="ФИО куратора вашей группы" required value={formData.curator_name || ''} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('register.phone')}</label>
            <input className="form-input" name="phone" placeholder="+7 (700) 000-00-00" required value={formData.phone || ''} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('register.activity')}</label>
            <select className="form-input" name="activity_id" required value={formData.activity_id} onChange={handleChange}>
              <option value="" disabled style={{ color: '#111', background: '#fff' }}>{t('register.activity.select')}</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id} style={{ color: '#111', background: '#fff' }}>
                  {act.title} ({act.type === 'section' ? t('nav.sections') : t('nav.clubs')})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '16px', fontSize: '1rem' }} disabled={loading}>
            {loading ? t('register.submitting') : t('register.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;