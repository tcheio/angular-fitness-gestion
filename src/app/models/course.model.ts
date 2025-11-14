export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  id: number;
  title: string;
  coach: string;
  start: Date;
  end: Date;
  capacity: number;
  level: CourseLevel;
  room: string;
  participantsCount: number;
}
