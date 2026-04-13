import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';

import Header from './components/Header';
import Home from './pages/Home';
import Activities from './pages/Activities';
import Register from './pages/Register';
import LibraryScanner from './pages/LibraryScanner';
import LibraryForm from './pages/LibraryForm';
import Admin from './pages/Admin';
import ActivityDetail from './pages/ActivityDetail';
import { useLanguage } from './context/LanguageContext';

function App() {
  const { t } = useLanguage();
  return (
    <LanguageProvider>
      <Router>
      {/* Animated background layers */}
      <div className="bg-grid" />
      <div className="bg-animated">
        <div className="bg-orb3" />
      </div>

      {/* Sticky header */}
      <Header />

      {/* Page content */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/sections" element={<Activities type="section" />} />
          <Route path="/clubs"    element={<Activities type="club" />} />
          <Route path="/activity/:id" element={<ActivityDetail />} />

          <Route path="/register"      element={<Register />} />
          <Route path="/library"       element={<LibraryScanner />} />
          <Route path="/library-form"  element={<LibraryForm />} />
          
          {/* Админ-панель */}
          <Route path="/admin"         element={<Admin />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="footer">
        <span className="footer-brand">
          ATC <span>Leisure</span> — {t('home.hero.badge').split(' — ')[0]}
        </span>
        <span className="footer-copy">© {new Date().getFullYear()} {t('footer.rights')}</span>
      </footer>
      </Router>
    </LanguageProvider>
  );
}

export default App;