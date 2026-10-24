import React, { useState, useEffect } from 'react';
import { CollageProvider, useCollage } from './context/CollageContext';
import { Navbar, type NavTab } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Dashboard } from './pages/Dashboard';
import { PhotoLibrary } from './pages/PhotoLibrary';
import { CollageStudio } from './pages/CollageStudio';
import { Templates } from './pages/Templates';
import { SavedProjects } from './pages/SavedProjects';
import { ExportPreview } from './pages/ExportPreview';
import { Settings } from './pages/Settings';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const { darkMode } = useCollage();

  // Apply/remove the `dark` class on <html> so Tailwind dark: variants work globally
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      darkMode ? 'bg-[#121214] text-zinc-100' : 'bg-[#FAF7F2] text-[#2C2723]'
    }`}>
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      <main className="flex-1 flex flex-col">
        {currentTab === 'dashboard' && <Dashboard onNavigate={setCurrentTab} />}
        {currentTab === 'library' && <PhotoLibrary />}
        {currentTab === 'studio' && <CollageStudio onNavigate={setCurrentTab} />}
        {currentTab === 'templates' && <Templates onNavigate={setCurrentTab} />}
        {currentTab === 'projects' && <SavedProjects onNavigate={setCurrentTab} />}
        {currentTab === 'export' && <ExportPreview onNavigate={setCurrentTab} />}
        {currentTab === 'settings' && <Settings />}
      </main>

      {/* Hide footer during studio mode to provide maximum viewport space for the canvas editor */}
      {currentTab !== 'studio' && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <CollageProvider>
      <AppContent />
    </CollageProvider>
  );
}
