/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Project, Event, Generation, StatsState } from '@/types/database';

// ============================================
// TIMER STORE - For time tracking
// ============================================
interface TimerState {
  isRunning: boolean;
  elapsedSeconds: number;
  startTime: number | null;
  currentProjectId: string | null;
  
  // Actions
  start: (projectId?: string) => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  elapsedSeconds: 0,
  startTime: null,
  currentProjectId: null,
  
  start: (projectId) => {
    set({
      isRunning: true,
      startTime: Date.now() - get().elapsedSeconds * 1000,
      currentProjectId: projectId || null,
    });
  },
  
  pause: () => {
    set({ isRunning: false });
  },
  
  reset: () => {
    set({
      isRunning: false,
      elapsedSeconds: 0,
      startTime: null,
    });
  },
  
  tick: () => {
    const { isRunning, startTime } = get();
    if (isRunning && startTime) {
      set({ elapsedSeconds: Math.floor((Date.now() - startTime) / 1000) });
    }
  },
}));

// ============================================
// TASKS STORE - Local task management
// ============================================
interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTasksStore = create<TasksState>((set, _get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  
  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
  })),
  
  toggleTaskStatus: (id) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === id
        ? { 
            ...t, 
            completed: !t.completed,
            status: !t.completed ? 'completed' : 'pending' 
          }
        : t
    ),
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ============================================
// EVENTS STORE - Calendar events
// ============================================
interface EventsState {
  events: Event[];
  selectedDate: Date;
  
  // Actions
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  setSelectedDate: (date: Date) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  selectedDate: new Date(),
  
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (id, updates) => set((state) => ({
    events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
  })),
  deleteEvent: (id) => set((state) => ({
    events: state.events.filter((e) => e.id !== id),
  })),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));

// ============================================
// PROJECTS STORE - Project management
// ============================================
interface ProjectsState {
  projects: Project[];
  currentProjectId: string | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  currentProjectId: null,
  
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
  })),
  setCurrentProject: (id) => set({ currentProjectId: id }),
}));

// ============================================
// GENERATIONS STORE - AI generations history
// ============================================
interface GenerationsState {
  generations: Generation[];
  currentGeneration: Generation | null;
  isGenerating: boolean;
  
  // Actions
  setGenerations: (generations: Generation[]) => void;
  addGeneration: (generation: Generation) => void;
  updateGeneration: (id: string, updates: Partial<Generation>) => void;
  setCurrentGeneration: (generation: Generation | null) => void;
  setIsGenerating: (generating: boolean) => void;
}

export const useGenerationsStore = create<GenerationsState>((set) => ({
  generations: [],
  currentGeneration: null,
  isGenerating: false,
  
  setGenerations: (generations) => set({ generations }),
  addGeneration: (generation) => set((state) => ({ 
    generations: [generation, ...state.generations] 
  })),
  updateGeneration: (id, updates) => set((state) => ({
    generations: state.generations.map((g) => (g.id === id ? { ...g, ...updates } : g)),
  })),
  setCurrentGeneration: (generation) => set({ currentGeneration: generation }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}));

// ============================================
// UI STORE - UI state (persisted)
// ============================================
interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  notifications: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'light',
      notifications: true,
      
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
    }),
    {
      name: 'aurion-ui-settings',
    }
  )
);

// ============================================
// STATS STORE - Dashboard statistics
// ============================================
interface StatsStore {
  stats: Partial<StatsState>;
  setStats: (stats: Partial<StatsState>) => void;
}

export const useStatsStore = create<StatsStore>((set) => ({
  stats: {
    employees: 0,
    hirings: 0,
    projects: 0,
    weeklyHours: 0,
    onboardingProgress: 0,
  },
  
  setStats: (newStats) => set((state) => ({ stats: { ...state.stats, ...newStats } })),
}));
