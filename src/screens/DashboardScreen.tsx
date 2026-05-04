import React from 'react';
import { useData } from '../lib/useData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Calendar, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function DashboardScreen() {
  const { tasks, habits } = useData();

  // Mock data for weekly stats
  const data = [
    { name: 'M', completed: 4 },
    { name: 'T', completed: 3 },
    { name: 'W', completed: 7 },
    { name: 'T', completed: 5 },
    { name: 'F', completed: 6 },
    { name: 'S', completed: 8 },
    { name: 'S', completed: 5 },
  ];

  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);
  const topHabit = habits.length > 0 ? habits.sort((a, b) => b.streak - a.streak)[0] : null;

  return (
    <div className="px-6 pt-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight dark:text-white">Productivity</h1>
        <p className="text-xs text-slate-500 font-medium tracking-wide font-sans">YOUR WEEKLY INSIGHTS</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard 
          icon={<TrendingUp size={18} className="text-primary" />} 
          label="COMPLETION" 
          value="84%" 
          color="bg-primary/5" 
        />
        <StatCard 
          icon={<Zap size={18} className="text-streak" />} 
          label="STREAK" 
          value={totalStreak.toString()} 
          color="bg-streak/5" 
        />
      </div>

      {/* Chart Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-8 shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Activity Last 7 Days</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
              <Bar dataKey="completed" fill="#4f46e5" radius={[4, 4, 4, 4]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Best Performing Habit */}
      {topHabit && (
        <section className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="bg-primary text-white p-2.5 rounded-xl">
            <Trophy size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Top Performer</h4>
            <div className="flex items-center gap-2">
               <span className="font-bold text-sm dark:text-white">{topHabit.name}</span>
               <span className="text-[10px] font-bold text-primary">{topHabit.streak}d Streak</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm"
    >
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", color)}>
        {icon}
      </div>
      <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold dark:text-white">{value}</p>
    </motion.div>
  );
}
