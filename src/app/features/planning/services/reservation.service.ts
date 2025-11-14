import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Reservation } from '../../../models/reservation.model';
import { PlanningService } from './planning.service';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly _reservations$ = new BehaviorSubject<Reservation[]>([]);

  // Pour l'instant, on simule un utilisateur connecté avec l'id 1
  private readonly currentUserId = 1;

  constructor(private readonly planningService: PlanningService) {}

  get reservations$(): Observable<Reservation[]> {
    return this._reservations$.asObservable();
  }

  get snapshot(): Reservation[] {
    return this._reservations$.value;
  }

  getUserReservations(userId: number = this.currentUserId): Reservation[] {
    return this.snapshot.filter(r => r.userId === userId);
  }

  canReserve(courseId: number, userId: number = this.currentUserId): boolean {
    const course = this.planningService.getCourseById(courseId);
    if (!course) return false;

    // déjà réservé ?
    const alreadyReserved = this.snapshot.some(
      r => r.courseId === courseId && r.userId === userId
    );
    if (alreadyReserved) return false;

    // cours plein ?
    if (course.participantsCount >= course.capacity) return false;

    return true;
  }

  addReservation(courseId: number, userId: number = this.currentUserId): boolean {
    if (!this.canReserve(courseId, userId)) {
      return false;
    }

    const reservations = this.snapshot;
    const newId = reservations.length
      ? Math.max(...reservations.map(r => r.id)) + 1
      : 1;

    const newReservation: Reservation = {
      id: newId,
      userId,
      courseId,
      createdAt: new Date(),
    };

    // Mise à jour des réservations
    this._reservations$.next([...reservations, newReservation]);

    // Mise à jour du nombre de participants dans le cours
    const course = this.planningService.getCourseById(courseId);
    if (course) {
      this.planningService.updateCourse(courseId, {
        participantsCount: course.participantsCount + 1,
      });
    }

    return true;
  }

  cancelReservation(reservationId: number): void {
    const reservations = this.snapshot;
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    // On retire la réservation
    this._reservations$.next(
      reservations.filter(r => r.id !== reservationId)
    );

    // On décrémente les participants dans le cours
    const course = this.planningService.getCourseById(reservation.courseId);
    if (course && course.participantsCount > 0) {
      this.planningService.updateCourse(course.id, {
        participantsCount: course.participantsCount - 1,
      });
    }
  }
}
