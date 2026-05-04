import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { ArrowLeft, Check, Calendar, Clock, Repeat, Target } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

interface AddScreenProps {
  onBack: () => void;
}

export default function AddScreen({ onBack }: AddScreenProps) {
  const { user } = useAuth();
  const [type, setType] = useState<'task' | 'habit'>('task');
  const [name, setName] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [isFocusTask, setIsFocusTask] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setLoading(true);
    try {
      if (type === 'task') {
        const path = 'tasks';
        await addDoc(collection(db, path), {
          userId: user?.uid,
          name,
          completed: false,
          date: format(new Date(), 'yyyy-MM-dd'),
          reminderTime,
          isFocusTask,
          createdAt: Date.now()
        });
        toast.success('Task added!');
      } else {
        const path = 'habits';
        await addDoc(collection(db, path), {
          userId: user?.uid,
          name,
          frequency,
          reminderTime,
          streak: 0,
          active: true,
          createdAt: Date.now()
        });
        toast.success('Habit created!');
      }
      onBack();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, type === 'task' ? 'tasks' : 'habits');
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 h-full flex flex-col pt-6 px-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">New {type === 'task' ? 'Task' : 'Habit'}</h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto pb-10 scrollbar-hide">
        {/* Toggle Type */}
        <div className="flex p-1 bg-slate-50 dark:bg-slate-900 rounded-2xl">
          <button
            onClick={() => setType('task')}
            className={cn(
              "flex-1 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
              type === 'task' ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-400"
            )}
          >
            TASK
          </button>
          <button
            onClick={() => setType('habit')}
            className={cn(
              "flex-1 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
              type === 'habit' ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-400"
            )}
          >
            HABIT
          </button>
        </div>

        {/* Name Input */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Description</label>
          <input
            autoFocus
            type="text"
            placeholder={type === 'task' ? "Finish UI Audit" : "Daily Yoga"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border-b border-slate-100 dark:border-slate-800 py-4 text-xl font-bold tracking-tight focus:border-primary outline-none transition-colors dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-800"
          />
        </div>

        {/* Options */}
        <div className="space-y-4">
          <OptionRow 
            icon={<Clock size={18} />} 
            label="Reminder" 
            value={
              <input 
                type="time" 
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="bg-transparent text-primary text-sm font-bold outline-none" 
              />
            } 
          />

          {type === 'habit' && (
            <OptionRow 
              icon={<Repeat size={18} />} 
              label="Frequency" 
              value={
                <select 
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="bg-transparent text-primary text-sm font-bold outline-none border-none focus:ring-0 cursor-pointer"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              } 
            />
          )}

          {type === 'task' && (
            <OptionRow 
              icon={<Target size={18} />} 
              label="Focus Task" 
              value={
                <button 
                  onClick={() => setIsFocusTask(!isFocusTask)}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    isFocusTask ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-sm",
                    isFocusTask && "translate-x-5"
                  )} />
                </button>
              } 
            />
          )}
        </div>
      </div>

      <div className="py-6 bg-white dark:bg-slate-950">
        <button
          disabled={loading}
          onClick={handleSave}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Check size={18} />
              CONFIRM {type}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function OptionRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="text-primary opacity-70">
          {icon}
        </div>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-tight">{label}</span>
      </div>
      {value}
    </div>
  );
}
