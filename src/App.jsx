import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { useFinance } from './context/FinanceContext';
import { NotificationProvider } from './context/NotificationContext';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import SmartEntry from './components/SmartEntry';
import Sandbox from './components/Sandbox';
import Learn from './components/Learn';
import Legacy from './components/Legacy';
import Settings from './components/Settings';
import Analytics from './components/Analytics';
import Notifications from './components/Notifications';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MobileNavigation from './components/MobileNavigation';

function AppContent() {
  const { isAuthenticated, isLoading, activeTab, sandboxMode } = useFinance();
  const [showLanding, setShowLanding] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authIsLogin, setAuthIsLogin] = useState(true);



  // Reset to landing page when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLanding(true);
      setAuthIsLogin(true);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-600 to-purple-600 mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-500">Loading FinanceVault...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showLanding) {
      return (
        <LandingPage
          onLogin={() => { setAuthIsLogin(true); setShowLanding(false); }}
          onSignup={() => { setAuthIsLogin(false); setShowLanding(false); }}
        />
      );
    }
    return <Auth onBack={() => setShowLanding(true)} initialIsLogin={authIsLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />;
      case 'analytics':
        return <Analytics />;
      case 'entry':
        return <SmartEntry />;
      case 'sandbox':
        return <Sandbox />;
      case 'learn':
        return <Learn />;
      case 'legacy':
        return <Legacy />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen bg-white transition-colors duration-300 text-gray-900`}>
      {/* Desktop Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <TopBar />

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
