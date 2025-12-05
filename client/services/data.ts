import type { ClassRoom, AttendanceRecord, User, DashboardStats, StudentStats } from "@/types";

const DEMO_CLASSES: ClassRoom[] = [
  {
    id: "class-1",
    name: "Room 101",
    latitude: 19.076,
    longitude: 72.8777,
    radius: 50,
    schedule: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "10:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "10:00" },
    ],
    instructorId: "faculty-1",
    instructorName: "Dr. Smith",
  },
  {
    id: "class-2",
    name: "Lab A",
    latitude: 19.0758,
    longitude: 72.878,
    radius: 50,
    schedule: [
      { dayOfWeek: 2, startTime: "11:00", endTime: "13:00" },
      { dayOfWeek: 4, startTime: "11:00", endTime: "13:00" },
    ],
    instructorId: "faculty-1",
    instructorName: "Dr. Smith",
  },
  {
    id: "class-3",
    name: "Auditorium",
    latitude: 19.0762,
    longitude: 72.8765,
    radius: 50,
    schedule: [
      { dayOfWeek: 1, startTime: "14:00", endTime: "15:30" },
      { dayOfWeek: 5, startTime: "14:00", endTime: "15:30" },
    ],
    instructorId: "faculty-2",
    instructorName: "Prof. Johnson",
  },
];

function generateAttendanceRecords(userId: string, userName: string): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const now = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    DEMO_CLASSES.forEach((classRoom) => {
      const hasSession = classRoom.schedule.some((s) => s.dayOfWeek === date.getDay());
      if (!hasSession) return;
      
      const status = Math.random() > 0.2 ? "present" : "absent";
      const session = classRoom.schedule.find((s) => s.dayOfWeek === date.getDay());
      
      records.push({
        id: `att-${classRoom.id}-${date.toISOString().split("T")[0]}`,
        date: date.toISOString().split("T")[0],
        classId: classRoom.id,
        className: classRoom.name,
        studentId: userId,
        studentName: userName,
        status: status as "present" | "absent",
        timestamp: `${date.toISOString().split("T")[0]}T${session?.startTime || "09:00"}:00`,
        location: status === "present" ? {
          latitude: classRoom.latitude + (Math.random() - 0.5) * 0.0002,
          longitude: classRoom.longitude + (Math.random() - 0.5) * 0.0002,
          accuracy: 5 + Math.random() * 10,
        } : undefined,
        distance: status === "present" ? Math.random() * 30 : undefined,
      });
    });
  }
  
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getClasses(): ClassRoom[] {
  return DEMO_CLASSES;
}

export function getClassById(id: string): ClassRoom | undefined {
  return DEMO_CLASSES.find((c) => c.id === id);
}

export function getAttendanceRecords(userId: string, userName: string): AttendanceRecord[] {
  return generateAttendanceRecords(userId, userName);
}

export function getTodayAttendance(userId: string): Map<string, AttendanceRecord> {
  const today = new Date().toISOString().split("T")[0];
  const records = generateAttendanceRecords(userId, "User");
  const todayRecords = records.filter((r) => r.date === today);
  return new Map(todayRecords.map((r) => [r.classId, r]));
}

export function getStudentStats(userId: string): StudentStats {
  const records = generateAttendanceRecords(userId, "User");
  const presentCount = records.filter((r) => r.status === "present").length;
  const totalCount = records.length;
  
  let streak = 0;
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  for (const record of sortedRecords) {
    if (record.status === "present") {
      streak++;
    } else {
      break;
    }
  }
  
  return {
    attendancePercentage: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
    classesAttended: presentCount,
    totalClasses: totalCount,
    streak: Math.min(streak, 7),
  };
}

export function getDashboardStats(): DashboardStats {
  return {
    totalClasses: DEMO_CLASSES.length,
    averageAttendance: 87,
    activeStudents: 45,
    presentToday: 38,
  };
}

export function getLiveAttendance(classId: string): { studentId: string; studentName: string; status: string; time: string; distance: number }[] {
  const students = [
    { studentId: "s1", studentName: "Alice Johnson", status: "present", time: "09:02", distance: 12 },
    { studentId: "s2", studentName: "Bob Williams", status: "present", time: "09:05", distance: 8 },
    { studentId: "s3", studentName: "Carol Davis", status: "present", time: "09:01", distance: 25 },
    { studentId: "s4", studentName: "David Brown", status: "absent", time: "-", distance: 0 },
    { studentId: "s5", studentName: "Emma Wilson", status: "present", time: "09:03", distance: 15 },
    { studentId: "s6", studentName: "Frank Miller", status: "present", time: "09:08", distance: 42 },
    { studentId: "s7", studentName: "Grace Lee", status: "pending", time: "-", distance: 0 },
    { studentId: "s8", studentName: "Henry Chen", status: "present", time: "09:00", distance: 5 },
  ];
  return students;
}

export function getWeeklyTrend(): { day: string; attendance: number }[] {
  return [
    { day: "Mon", attendance: 92 },
    { day: "Tue", attendance: 88 },
    { day: "Wed", attendance: 85 },
    { day: "Thu", attendance: 90 },
    { day: "Fri", attendance: 82 },
  ];
}

export function getClassBreakdown(): { name: string; attendance: number; color: string }[] {
  return [
    { name: "Room 101", attendance: 95, color: "#667eea" },
    { name: "Lab A", attendance: 88, color: "#764ba2" },
    { name: "Auditorium", attendance: 78, color: "#10b981" },
  ];
}

export function markAttendance(
  userId: string,
  userName: string,
  classId: string,
  className: string,
  location: { latitude: number; longitude: number; accuracy: number },
  distance: number
): AttendanceRecord {
  const now = new Date();
  return {
    id: `att-${classId}-${now.getTime()}`,
    date: now.toISOString().split("T")[0],
    classId,
    className,
    studentId: userId,
    studentName: userName,
    status: "present",
    timestamp: now.toISOString(),
    location,
    distance,
  };
}

export function hasAttendanceToday(userId: string, classId: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  const records = generateAttendanceRecords(userId, "User");
  return records.some((r) => r.classId === classId && r.date === today);
}

export function generateCSVReport(records: AttendanceRecord[]): string {
  const headers = ["Date", "Class", "Student", "Status", "Time", "Distance (m)"];
  const rows = records.map((r) => [
    r.date,
    r.className,
    r.studentName,
    r.status,
    r.timestamp.split("T")[1]?.substring(0, 5) || "-",
    r.distance?.toFixed(1) || "-",
  ]);
  
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
