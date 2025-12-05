export type UserRole = "student" | "faculty";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  schedule: ClassSchedule[];
  instructorId: string;
  instructorName: string;
}

export interface ClassSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export type AttendanceStatus = "present" | "absent" | "pending";

export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  distance?: number;
}

export interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasAcceptedGDPR: boolean;
  hasCompletedOnboarding: boolean;
}

export interface ClassWithDistance extends ClassRoom {
  distance: number;
  isInRange: boolean;
  nextSession?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  };
  attendanceToday?: AttendanceStatus;
}

export interface DashboardStats {
  totalClasses: number;
  averageAttendance: number;
  activeStudents: number;
  presentToday: number;
}

export interface StudentStats {
  attendancePercentage: number;
  classesAttended: number;
  totalClasses: number;
  streak: number;
}
