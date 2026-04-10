import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [formData, setFormData] = useState({
    student_name: '',
    group_name: '',
    curator_name: '',
    phone: '',
    activity_id: ''
  });
  const [loading, setLoading] = useState(false);

  // Загружаем список кружков/секций для выпадающего списка
  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase.from('activities').select('id, title, type');
      if (data) setActivities(data);
      if (error) console.error('Ошибка загрузки активностей:', error);
    };
    fetchActivities();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('registrations')
      .insert([formData]);

    setLoading(false);

    if (error) {
      alert('Ошибка при записи. Проверь консоль.');
      console.error(error);
    } else {
      alert('Успешно! Ты записан.');
      navigate('/'); // Возвращаем на главную
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <input name="student_name" placeholder="ФИО" required onChange={handleChange} />
        <input name="group_name" placeholder="Группа (напр. ИС-202)" required onChange={handleChange} />
        <input name="curator_name" placeholder="ФИО Куратора" required onChange={handleChange} />
        <input name="phone" placeholder="Номер телефона" required onChange={handleChange} />

        <select name="activity_id" required onChange={handleChange} defaultValue="">
          <option value="" disabled>Выберите кружок или секцию...</option>
          {activities.map((act) => (
            <option key={act.id} value={act.id}>
              {act.title} ({act.type === 'section' ? 'Секция' : 'Кружок'})
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Отправка...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};

export default Register;