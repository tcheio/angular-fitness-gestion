import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

import { Course } from '../../../../models/course.model';
import { PlanningService } from '../../services/planning.service';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-planning-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule],
  templateUrl: './planning-calendar.component.html',
  styleUrls: ['./planning-calendar.component.scss'],
})
export class PlanningCalendarComponent implements OnInit {
  courses: Course[] = [];
  selectedDate: Date | null = null;

  constructor(
    private readonly planningService: PlanningService,
    private readonly reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.planningService.courses$.subscribe(courses => {
      this.courses = courses;
    });

    this.selectedDate = new Date();
  }

  get coursesForSelectedDay(): Course[] {
    if (!this.selectedDate) return [];
    return this.courses.filter(c => this.isSameDay(c.start, this.selectedDate!));
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    const a = new Date(d1);
    const b = new Date(d2);
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
    return a.getTime() === b.getTime();
  }

  // utilisé par la pastille bleue
  hasCourse(dateMeta: any): boolean {
    const d = new Date(dateMeta.year, dateMeta.month, dateMeta.day);
    return this.courses.some(c => this.isSameDay(c.start, d));
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

  onDateChange(date: Date | null) {
    this.selectedDate = date;
  }
}
