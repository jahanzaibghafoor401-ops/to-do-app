import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { Task, Habit, HabitCompletion } from '../types';
import { format } from 'date-fns';

export function useData() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Subscribe to tasks for today
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      where('date', '==', todayStr),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    });

    // Subscribe to habits
    const habitsQuery = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid),
      where('active', '==', true)
    );

    const unsubscribeHabits = onSnapshot(habitsQuery, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit)));
    });

    // Subscribe to habit completions for today
    const completionsQuery = query(
      collection(db, 'habitCompletions'),
      where('userId', '==', user.uid),
      where('date', '==', todayStr)
    );

    const unsubscribeCompletions = onSnapshot(completionsQuery, (snapshot) => {
      setCompletions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HabitCompletion)));
      setLoading(false);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeHabits();
      unsubscribeCompletions();
    };
  }, [user]);

  return { tasks, habits, completions, loading };
}
