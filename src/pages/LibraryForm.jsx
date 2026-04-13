import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const LibraryForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookId = searchParams.get('bookId'); // Тянем ID книги из URL

  const [formData, setFormData] = useState({
    student_name: '',
    group_name: '',
    quantity: 1,
    book_id: bookId
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('library_requests')
      .insert(formData); // Changed from [formData] to formData

    if (!error) {
      alert('Заявка успешно отправлена!');
      navigate('/');
    } else {
      alert('Ошибка при отправке: ' + error.message);
    }
  };

  return (
    <div className="page-wrapper reveal visible" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 72px)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 className="section-title" style={{ fontSize: '2rem' }}>
            <span className="text-gradient-orange">Оформление книги</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '0.95rem' }}>
            ID книги: <strong>{bookId}</strong>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">ФИО студента (читателя)</label>
            <input 
              className="form-input"
              name="student_name"
              placeholder="Иванов Иван Иванович" 
              required 
              value={formData.student_name || ''}
              onChange={(e) => setFormData({...formData, student_name: e.target.value})} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Группа</label>
            <input 
              className="form-input"
              name="group_name"
              placeholder="напр. ИС-202" 
              required 
              value={formData.group_name || ''}
              onChange={(e) => setFormData({...formData, group_name: e.target.value})} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Количество экземпляров</label>
            <input 
              className="form-input"
              type="number" 
              min="1" 
              value={formData.quantity || 1}
              onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '16px', fontSize: '1rem' }}>
            Подтвердить выдачу
          </button>
        </form>
      </div>
    </div>
  );
};

export default LibraryForm;