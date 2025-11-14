import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Course } from '../../../../models/course.model';
import { PlanningService } from '../../services/planning.service';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-planning-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planning-calendar.component.html',
  styleUrls: ['./planning-calendar.component.scss'],
})
export class PlanningCalendarComponent implements OnInit {
  courses$!: Observable<Course[]>;

  constructor(
    private readonly planningService: PlanningService,
    private readonly reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.courses$ = this.planningService.courses$;
  }

  getRemainingPlaces(course: Course): number {
    return course.capacity - course.participantsCount;
  }

  canReserve(course: Course): boolean {
    return (
      this.getRemainingPlaces(course) > 0 &&
      this.reservationService.canReserve(course.id)
    );
  }

  reserve(course: Course): void {
    const ok = this.reservationService.addReservation(course.id);

    if (!ok) {
      alert('Impossible de réserver ce cours (complet ou déjà réservé).');
      return;
    }

    alert('Réservation enregistrée ✅');
  }
}
