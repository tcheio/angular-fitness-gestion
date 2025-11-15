import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Course, CourseLevel } from '../../../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class PlanningService {
  private readonly _courses$ = new BehaviorSubject<Course[]>([
    {
      id: 1,
      title: 'Yoga douceur',
      coach: 'Camille',
      start: new Date('2025-11-20T09:00:00'),
      end: new Date('2025-11-20T10:00:00'),
      capacity: 10,
      level: 'beginner',
      room: 'Studio 1',
      participantsCount: 4,
    },
    {
      id: 2,
      title: 'CrossFit Intense',
      coach: 'Thomas',
      start: new Date('2025-11-20T18:00:00'),
      end: new Date('2025-11-20T19:00:00'),
      capacity: 12,
      level: 'advanced',
      room: 'Salle 2',
      participantsCount: 11,
    },
    {
      id: 3,
      title: 'Cardio HIIT',
      coach: 'Sarah',
      start: new Date('2025-11-21T19:00:00'),
      end: new Date('2025-11-21T19:45:00'),
      capacity: 15,
      level: 'intermediate',
      room: 'Studio 1',
      participantsCount: 8,
    },
  ]);

  get courses$(): Observable<Course[]> {
    return this._courses$.asObservable();
  }

  get snapshot(): Course[] {
    return this._courses$.value;
  }

  addCourse(course: Omit<Course, 'id' | 'participantsCount'>): void {
    const courses = this.snapshot;
    const newId = courses.length ? Math.max(...courses.map(c => c.id)) + 1 : 1;

    const newCourse: Course = {
      ...course,
      id: newId,
      participantsCount: 0,
    };

    this._courses$.next([...courses, newCourse]);
  }

  updateCourse(id: number, patch: Partial<Course>): void {
    const updated = this.snapshot.map(c =>
      c.id === id ? { ...c, ...patch } : c
    );
    this._courses$.next(updated);
  }

  deleteCourse(id: number): void {
    this._courses$.next(this.snapshot.filter(c => c.id !== id));
  }

  getCourseById(id: number): Course | undefined {
    return this.snapshot.find(c => c.id === id);
  }

  get levels(): CourseLevel[] {
    return ['beginner', 'intermediate', 'advanced'];
  }
}
