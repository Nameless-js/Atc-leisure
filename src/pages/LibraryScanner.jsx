import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const LibraryScanner = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    // Настройки сканера
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    // Успешное сканирование
    const onScanSuccess = (decodedText) => {
      scanner.clear(); // Выключаем камеру
      setScanResult(decodedText);
      // Перекидываем на форму выдачи книги, передавая ID книги в URL
      navigate(`/library-form?bookId=${decodedText}`);
    };

    const onScanFailure = (error) => {
      // Игнорируем ошибки, пока код не найден
    };

    scanner.render(onScanSuccess, onScanFailure);

    // Очистка при уходе со страницы
    return () => {
      scanner.clear().catch(error => console.error("Failed to clear html5QrcodeScanner. ", error));
    };
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '50px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>{t('library.scanner.title')}</h2>
      <p>{t('library.scanner.subtitle')}</p>
      
      {/* Сюда библиотека встроит интерфейс камеры */}
      <div id="reader" style={{ width: '100%' }}></div>
      
      <button onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
        {t('ui.cancel')}
      </button>
    </div>
  );
};

export default LibraryScanner;