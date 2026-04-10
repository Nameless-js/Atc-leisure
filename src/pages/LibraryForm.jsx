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
      .insert([formData]);

    if (!error) {
      alert('Заявка успешно отправлена!');
      navigate('/');
    } else {
      alert('Ошибка при отправке: ' + error.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #eee', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center' }}>Оформление книги</h2>
      <p style={{ color: '#666', textAlign: 'center' }}>ID книги: <strong>{bookId}</strong></p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          placeholder="Ваше ФИО" 
          required 
          onChange={(e) => setFormData({...formData, student_name: e.target.value})} 
        />
        <input 
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          placeholder="Группа (напр. ИС-202)" 
          required 
          onChange={(e) => setFormData({...formData, group_name: e.target.value})} 
        />
        <label>
          Количество:
          <input 
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #ccc' }}
            type="number" 
            min="1" 
            defaultValue="1" 
            onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} 
          />
        </label>
        <button type="submit" style={{ padding: '12px', background: '#00d1b2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Подтвердить выдачу
        </button>
      </form>
    </div>
  );
};

export default LibraryForm;