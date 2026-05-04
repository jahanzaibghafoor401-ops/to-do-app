export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  settings: {
    focusMode: boolean;
    theme: 'light' | 'dark';
    notificationsEnabled: boolean;
  };
}

export interface Task {
  id: string;
  userId: string;
  name: string;
  completed: boolean;
  date: string; // ISO date string YYYY-MM-DD
  reminderTime?: string; // HH:mm
  isFocusTask: boolean;
  createdAt: number;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'custom';
  reminderTime?: string;
  streak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  active: boolean;
  createdAt: number;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
}
