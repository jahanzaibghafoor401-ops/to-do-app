import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { logout } from '../lib/firebase';
import { User, Shield, Moon, Bell, LogOut, Trash2, Smartphone, Target } from 'lucide-react';
import { doc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export default function SettingsScreen() {
  const { profile, user } = useAuth();

  const toggleSetting = async (key: string, value: any) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [`settings.${key}`]: value
      });
      toast.success('Setting updated');
    } catch (e) {
      toast.error('Failed to update setting');
    }
  };

  const resetStreaks = async () => {
    if (!window.confirm('Reset all habit streaks? This cannot be undone.')) return;
    
    try {
      const q = query(collection(db, 'habits'), where('userId', '==', user?.uid));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (d) => {
        await updateDoc(d.ref, { streak: 0, lastCompletedDate: null });
      });
      toast.success('All streaks reset');
    } catch (e) {
      toast.error('Failed to reset streaks');
    }
  };

  return (
    <div className="px-6 pt-6 pb-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight dark:text-white">Settings</h1>
        <p className="text-xs text-slate-500 font-medium tracking-wide">PREFERENCES & ACCOUNT</p>
      </header>

      {/* Profile Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-8 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-2xl">
          <User size={28} />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight dark:text-white leading-tight">{profile?.displayName}</h3>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">{profile?.email}</p>
        </div>
      </section>

      {/* Settings Groups */}
      <div className="space-y-3 mb-10">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Preferences</h3>
        
        <SettingToggle 
          icon={<Target size={18} className="text-streak" />} 
          label="Focus Mode" 
          desc="Limit to 3 tasks"
          active={profile?.settings.focusMode || false} 
          onToggle={(val) => toggleSetting('focusMode', val)} 
        />
        
        <SettingToggle 
          icon={<Moon size={18} className="text-primary" />} 
          label="Dark Mode" 
          desc="System theme"
          active={profile?.settings.theme === 'dark'} 
          onToggle={(val) => toggleSetting('theme', val ? 'dark' : 'light')} 
        />

        <SettingToggle 
          icon={<Bell size={18} className="text-success" />} 
          label="Notifications" 
          desc="Reminders & Alerts"
          active={profile?.settings.notificationsEnabled || false} 
          onToggle={(val) => toggleSetting('notificationsEnabled', val)} 
        />

        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mt-8">System</h3>
        
        <button 
          onClick={resetStreaks}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl group transition-all active:scale-95 shadow-sm"
        >
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl">
               <Trash2 size={18} />
             </div>
             <div className="text-left">
                <span className="font-bold text-sm block dark:text-white">Reset Streaks</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Clear all history</span>
             </div>
          </div>
        </button>

        <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all active:scale-95 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl">
               <Smartphone size={18} />
             </div>
             <div className="text-left">
                <span className="font-bold text-sm block dark:text-white">Device Sync</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Manage devices</span>
             </div>
          </div>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={() => logout()}
        className="w-full flex items-center justify-center gap-3 py-4 bg-slate-50 dark:bg-slate-900 text-red-500 font-bold rounded-2xl active:scale-95 transition-all text-sm uppercase tracking-widest"
      >
        <LogOut size={18} />
        Sign Out
      </button>

      <p className="text-center text-[10px] text-slate-300 dark:text-slate-700 uppercase mt-8 tracking-widest font-bold">
        Smart To-Do v1.0.0
      </p>
    </div>
  );
}

function SettingToggle({ icon, label, desc, active, onToggle }: { icon: React.ReactNode, label: string, desc: string, active: boolean, onToggle: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm transition-all">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm dark:text-white leading-tight">{label}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase">{desc}</span>
        </div>
      </div>
      <button 
        onClick={() => onToggle(!active)}
        className={cn(
          "w-10 h-5 rounded-full relative transition-colors",
          active ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
        )}
      >
        <div className={cn(
          "absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-sm",
          active && "translate-x-5"
        )} />
      </button>
    </div>
  );
}
