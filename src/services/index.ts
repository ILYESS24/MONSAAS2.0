/**
 * Services Export
 * 
 * Central export point for all services.
 */

// API Services
export { 
  projectsService, 
  activitiesService, 
  tasksService, 
  statsService 
} from './api.service';
export type { DashboardStats } from './api.service';

// Analytics Service
export { analyticsService } from './analytics.service';

// Auth Service
export { authService } from './auth.service';
export type { AuthUser, AuthSession } from './auth.service';
