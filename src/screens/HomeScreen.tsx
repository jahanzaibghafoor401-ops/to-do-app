import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { useData } from '../lib/useData';
import { CheckCircle2, Circle, Flame, Target, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { doc, updateDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

interface HomeScreenProps {
  onNavigate: (screen: 'add') => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { profile } = useAuth();
  const { tasks, habits, completions, loading } = useData();

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        completed: !currentStatus
      });
      toast.success(!currentStatus ? 'Task completed!' : 'Task uncompleted');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `tasks/${taskId}`);
      toast.error('Failed to update task');
    }
  };

  const toggleHabit = async (habitId: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isCompleted = completions.some(c => c.habitId === habitId);

    try {
      if (isCompleted) {
        // Find and delete completion
        const q = query(
          collection(db, 'habitCompletions'),
          where('habitId', '==', habitId),
          where('date', '==', todayStr)
        );
        const snapshot = await getDocs(q);
        snapshot.forEach(async (d) => {
          try {
            await deleteDoc(d.ref);
          } catch (e) {
            handleFirestoreError(e, OperationType.DELETE, d.ref.path);
          }
        });
        
        // Update streak (decrement)
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
          await updateDoc(doc(db, 'habits', habitId), {
            streak: Math.max(0, habit.streak - 1),
            lastCompletedDate: null // Simplified for this demo
          });
        }
        toast.success('Habit unchecked');
      } else {
        // Add completion
        await addDoc(collection(db, 'habitCompletions'), {
          habitId,
          userId: profile?.uid,
          date: todayStr
        });
        
        // Update streak
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
          await updateDoc(doc(db, 'habits', habitId), {
            streak: habit.streak + 1,
            lastCompletedDate: todayStr
          });
        }
        toast.success('Nice! Streak increased! 🔥');
      }
      } catch (e) {
        handleFirestoreError(e, isCompleted ? OperationType.DELETE : OperationType.WRITE, isCompleted ? 'habitCompletions' : 'habits');
        toast.error('Failed to update habit');
      }
  };

  const todayTasks = profile?.settings.focusMode ? tasks.filter(t => t.isFocusTask).slice(0, 3) : tasks;
  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  return (
    <div className="px-6 pt-6">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Smart To-Do</h1>
          <p className="text-xs text-slate-500 font-medium">{format(new Date(), 'EEEE, MMM d')}</p>
        </div>
        <div className="flex items-center bg-indigo-50 dark:bg-primary/10 px-3 py-1.5 rounded-full">
          <span className="text-streak mr-1">🔥</span>
          <span className="text-primary font-bold text-sm">
            {habits.reduce((max, h) => Math.max(max, h.streak), 0)} Day Streak
          </span>
        </div>
      </header>

      {/* Progress Card */}
      <section className="bg-primary rounded-3xl p-5 text-white shadow-lg shadow-primary/10 mb-8 relative overflow-hidden">
        <div className="flex justify-between items-end relative z-10">
          <div>
            <p className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wider mb-1">Daily Progress</p>
            <h2 className="text-3xl font-bold">{completionRate}%</h2>
          </div>
          <div className="text-right">
            <p className="text-primary-foreground/80 text-[10px] mb-1">
              {tasks.filter(t => t.completed).length} of {tasks.length} Tasks
            </p>
            <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                className="h-full bg-white transition-all duration-1000"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Focus Mode Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {profile?.settings.focusMode ? 'Focus Mode: The Big 3' : 'Your Tasks'}
        </h3>
        {profile?.settings.focusMode && (
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400">ENABLED</span>
        )}
      </div>

      {/* Tasks Section */}
      <section className="mb-10 min-h-[120px]">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 dark:bg-slate-900 animate-pulse rounded-2xl" />)}
          </div>
        ) : todayTasks.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
            <p className="text-slate-400 text-sm italic font-medium">No tasks available...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-center p-4 rounded-2xl transition-all shadow-sm",
                  task.completed 
                    ? "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 opacity-60" 
                    : "bg-white dark:bg-slate-900 border-2 border-primary shadow-md shadow-primary/5 dark:border-primary"
                )}
              >
                <button 
                  onClick={() => toggleTask(task.id, task.completed)}
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center mr-4 transition-colors",
                    task.completed ? "bg-success" : "border-2 border-primary"
                  )}
                >
                  {task.completed && <CheckCircle2 size={16} className="text-white" />}
                </button>
                <div className="flex-1 text-left">
                  <h4 className={cn(
                    "text-sm font-bold block",
                    task.completed ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"
                  )}>
                    {task.name}
                  </h4>
                  {task.reminderTime && !task.completed && (
                    <span className="text-[10px] text-primary font-bold uppercase tracking-tight">
                      {task.reminderTime} • Reminder set
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
            
            {profile?.settings.focusMode && todayTasks.length < 3 && (
              <button 
                onClick={() => onNavigate('add')}
                className="w-full flex items-center p-4 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 mr-4"></div>
                <span className="text-slate-400 font-medium italic text-sm">Add focus slot...</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* Habit Tracking Header */}
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Daily Habits</h3>
      
      {/* Habits Grid */}
      <section className="mb-10">
        <div className="grid grid-cols-2 gap-3">
          {loading ? (
            [1, 2].map(i => <div key={i} className="h-20 bg-slate-50 dark:bg-slate-900 animate-pulse rounded-2xl" />)
          ) : habits.length === 0 ? (
            <div className="col-span-2 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-sm italic font-medium">Add a daily habit</p>
            </div>
          ) : (
            habits.map((habit) => {
              const isCompleted = completions.some(c => c.habitId === habit.id);
              return (
                <motion.div
                  key={habit.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleHabit(habit.id)}
                  className={cn(
                    "bg-white dark:bg-slate-900 border p-3 rounded-2xl shadow-sm cursor-pointer transition-all",
                    isCompleted ? "border-slate-100 dark:border-slate-800" : "border-slate-100 dark:border-slate-800 opacity-60"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-lg">
                      {habit.name.toLowerCase().includes('water') ? '💧' : 
                       habit.name.toLowerCase().includes('meditate') ? '🧘' : 
                       habit.name.toLowerCase().includes('read') ? '📚' : '✨'}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      isCompleted 
                        ? "text-success bg-success/10" 
                        : "text-slate-400 bg-slate-50 dark:bg-slate-800"
                    )}>
                      {habit.streak}d
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {habit.name}
                  </p>
                </motion.div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
