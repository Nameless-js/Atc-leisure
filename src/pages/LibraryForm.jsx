import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../context/LanguageContext';

const LibraryForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const bookId = searchParams.get('bookId'); // Тянем ID книги из URL

  const [formData, setFormData] = useState({
    student_name: localStorage.getItem('last_student_name') || '',
    group_name: localStorage.getItem('last_group_name') || '',
    book_name_input: '',
    quantity: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      student_name: formData.student_name,
      group_name: formData.group_name,
      // Вшиваем название книги прямо в book_id, чтобы не требовать новой колонки в БД
      book_id: formData.book_name_input ? `${formData.book_name_input} (Код: ${bookId})` : bookId,
      quantity: formData.quantity || 1
    };

    const { error } = await supabase
      .from('library_requests')
      .insert(payload); // Changed from [formData] to formData

    if (!error) {
      alert(t('msg.success.library'));
      localStorage.setItem('last_student_name', formData.student_name);
      localStorage.setItem('last_group_name', formData.group_name);
      navigate('/');
    } else {
      if (error.message.includes('invalid input syntax for type uuid')) {
        alert('Ошибка Базы Данных: Вы использовали текст вместо ID формата UUID.\n\nПожалуйста, зайдите в панель Supabase -> Table Editor -> "library_requests" и измените тип колонки "book_id" с "uuid" на "text". Это позволит использовать любые коды книг.');
      } else if (error.message.includes('column "book_name" of relation')) {
        alert('Ошибка Базы Данных: Отсутствует колонка "book_name".\n\nВ таблице "library_requests" нужно добавить колонку "book_name" (тип text), чтобы сохранялось название книги.');
      } else {
        alert('Ошибка при отправке: ' + error.message);
      }
    }
  };

  return (
    <div className="page-wrapper reveal visible" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 72px)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 className="section-title" style={{ fontSize: '2rem' }}>
            <span className="text-gradient-orange">{t('library.form.title')}</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '0.95rem' }}>
            {t('library.form.bookId')}: <strong>{bookId}</strong>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('library.form.reader')}</label>
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
            <label className="form-label">{t('register.group')}</label>
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
            <label className="form-label">{t('library.form.bookName')}</label>
            <input 
              className="form-input"
              name="book_name_input"
              placeholder={t('library.form.bookName.placeholder')} 
              required 
              value={formData.book_name_input || ''}
              onChange={(e) => setFormData({...formData, book_name_input: e.target.value})} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('library.form.quantity')}</label>
            <input 
              className="form-input"
              type="number" 
              min="1" 
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value === '' ? '' : parseInt(e.target.value) || 1})} 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '16px', fontSize: '1rem' }}>
            {t('library.form.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LibraryForm;