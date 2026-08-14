// Shapes returned by the gamification endpoints.
//
// Mirrors the backend models:
//   learncodeai-backend/src/models/UserGamification.js
//   learncodeai-backend/src/models/Streak.js
//   learncodeai-backend/src/models/Badge.js
//
// Populated references are widened to `string | Populated` because the same
// endpoint returns raw ids in some responses and populated documents in
// others.

export interface Badge {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  rarity?: string;
  pointsRequired?: number;
}

export interface EarnedBadge {
  badge: Badge | string;
  unlockedAt: string;
}

export interface Achievement {
  _id: string;
  name?: string;
  description?: string;
  icon?: string;
}

export interface PointsBreakdown {
  courseCompletion: number;
  tutorialCompletion: number;
  codeExecution: number;
  quizCompletion: number;
  streakBonus: number;
}

export interface GamificationStatistics {
  coursesCompleted: number;
  tutorialsCompleted: number;
  codeExecutions: number;
  quizzesCompleted: number;
  successfulExecutions: number;
  totalTimeSpentMinutes: number;
}

export interface PointsHistoryEntry {
  date: string;
  points: number;
  reason: string;
  relatedId?: string;
}

export interface GamificationStats {
  _id: string;
  user: string;
  totalPoints: number;
  level: number;
  experiencePoints: number;
  badges: EarnedBadge[];
  achievements: (Achievement | string)[];
  leaderboardRank: number | null;
  pointsBreakdown: PointsBreakdown;
  statistics: GamificationStatistics;
  lastPointsUpdate?: string;
  pointsHistory?: PointsHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLogEntry {
  date: string;
  activityType: string;
  points: number;
}

export interface Streak {
  _id: string;
  user: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakStartDate: string | null;
  totalStreakDays: number;
  activityLog?: ActivityLogEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaderboardEntry {
  _id?: string;
  rank?: number;
  totalPoints: number;
  level: number;
  user?: {
    _id: string;
    fullName?: string;
    username?: string;
    profilePicture?: string;
  };
}
