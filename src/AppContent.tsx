import React, { useState } from 'react';
import { useAuth } from './lib/AuthContext';
import { Home, LayoutDashboard, Plus, Bell, Settings, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { signInWithGoogle } from './lib/firebase';
import { Toaster } from 'react-hot-toast';

// Screens
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import AddScreen from './screens/AddScreen';
import RemindersScreen from './screens/RemindersScreen';
import SettingsScreen from './screens/SettingsScreen';

type Screen = 'home' | 'dashboard' | 'add' | 'reminders' | 'settings';

export default function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeScreen, setActiveScreen] = useState<Screen>('home');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white px-6 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-xs"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <LayoutDashboard className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">Smart To-Do</h1>
          <p className="text-gray-500 mb-10 leading-relaxed">
            A productivity app for managing daily tasks and building habits with streak tracking and focus mode.
          </p>
          <button
            id="login-button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-primary text-white py-4 px-6 rounded-2xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            <LogIn size={20} />
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home': return <HomeScreen onNavigate={(s) => setActiveScreen(s)} />;
      case 'dashboard': return <DashboardScreen />;
      case 'add': return <AddScreen onBack={() => setActiveScreen('home')} />;
      case 'reminders': return <RemindersScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <HomeScreen onNavigate={(s) => setActiveScreen(s)} />;
    }
  };

  return (
    <div className={cn("flex flex-col h-screen max-w-lg mx-auto bg-white overflow-hidden relative border-[8px] border-slate-900 rounded-[40px] shadow-2xl", profile?.settings?.theme === 'dark' && "dark bg-slate-950 border-slate-800")}>
      <Toaster position="top-center" />
      
      {/* Decorative Status Bar Area */}
      <div className="h-6 w-full flex justify-between px-8 items-center mt-2 shrink-0">
        <span className="text-[10px] font-bold dark:text-slate-400">9:41</span>
        <div className="flex space-x-1">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-slate-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-slate-700"></div>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav id="bottom-nav" className="absolute bottom-0 left-0 right-0 h-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around px-2 z-50">
        <NavButton active={activeScreen === 'home'} onClick={() => setActiveScreen('home')} icon={<Home size={22} />} label="Home" />
        <NavButton active={activeScreen === 'dashboard'} onClick={() => setActiveScreen('dashboard')} icon={<LayoutDashboard size={22} />} label="Stats" />
        
        {/* Floating Action Button */}
        <div className="-mt-12 group">
          <button
            id="fab"
            onClick={() => setActiveScreen('add')}
            className="bg-primary text-white w-14 h-14 rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center text-3xl font-bold ring-4 ring-white dark:ring-slate-950 transform active:scale-95 transition-all"
          >
            +
          </button>
        </div>

        <NavButton active={activeScreen === 'reminders'} onClick={() => setActiveScreen('reminders')} icon={<Bell size={22} />} label="Alerts" />
        <NavButton active={activeScreen === 'settings'} onClick={() => setActiveScreen('settings')} icon={<Settings size={22} />} label="Settings" />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors px-2 py-1",
        active ? "text-primary" : "text-slate-400 hover:text-slate-600 dark:text-slate-500"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}
