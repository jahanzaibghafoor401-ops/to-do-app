import React from 'react';
import { useData } from '../lib/useData';
import { Bell, Clock, Sun, Sunset, Moon, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function RemindersScreen() {
  const { tasks, habits } = useData();

  const allReminders = [
    ...tasks.filter(t => t.reminderTime).map(t => ({ ...t, type: 'Task' })),
    ...habits.filter(h => h.reminderTime).map(h => ({ ...h, type: 'Habit' }))
  ].sort((a, b) => (a.reminderTime || '').localeCompare(b.reminderTime || ''));

  const suggestions = [
    { label: 'Morning', time: '08:00', icon: <Sun size={18} className="text-amber-500" /> },
    { label: 'Afternoon', time: '14:00', icon: <Sunset size={18} className="text-streak" /> },
    { label: 'Evening', time: '19:00', icon: <Moon size={18} className="text-primary" /> },
  ];

  return (
    <div className="px-6 pt-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight dark:text-white">Alerts</h1>
        <p className="text-xs text-slate-500 font-medium tracking-wide">YOUR UPCOMING REMINDERS</p>
      </header>

      {/* Quick Suggestions */}
      <section className="mb-10">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Smart Suggestions</h3>
        <div className="grid grid-cols-3 gap-3">
          {suggestions.map((s) => (
            <button key={s.label} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex flex-col items-center gap-2 hover:border-primary transition-all active:scale-95 shadow-sm">
              {s.icon}
              <span className="text-[10px] font-bold dark:text-slate-300">{s.label}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">{s.time}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Reminders List */}
      <section>
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Scheduled Today</h3>
        
        {allReminders.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800">
             <Bell className="mx-auto text-slate-200 mb-2" size={32} />
             <p className="text-slate-400 text-sm italic font-medium">Clear schedule...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allReminders.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-slate-400">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[9px] font-bold text-primary uppercase">{item.type}</span>
                       <span className="text-[10px] font-bold text-slate-400 tracking-tighter">{item.reminderTime}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                  <Edit2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
