import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { PlanningService, PlanningCourse } from '../../services/planning.service';

@Component({
  selector: 'app-planning-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './planning-calendar.component.html',
  styleUrls: ['./planning-calendar.component.scss'],
})
export class PlanningCalendarComponent implements OnInit {
  /** Tous les cours issus du json-server */
  allCourses: PlanningCourse[] = [];

  /** Date sélectionnée dans le calendrier */
  selectedDate: Date | null = new Date();

  /** Cours filtrés pour la date sélectionnée (utilisé par le template) */
  coursesForSelectedDay: PlanningCourse[] = [];

  constructor(private planningService: PlanningService) {}

  ngOnInit(): void {
    this.planningService.getPlanningCourses().subscribe((courses) => {
      this.allCourses = courses;
      this.updateCoursesForSelectedDay();
    });
  }

  /** Quand on clique sur une date du calendrier */
  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.updateCoursesForSelectedDay();
  }

  /** Indique s'il existe au moins un cours pour la date de la cellule */
  hasCourse(dateMeta: any): boolean {
    if (!dateMeta) return false;
    const cellDate = new Date(dateMeta.year, dateMeta.month, dateMeta.day);
    const cellKey = this.toDateKey(cellDate);

    return this.allCourses.some(
      (course) => this.toDateKey(new Date(course.start)) === cellKey
    );
  }

  /** Nombre de places restantes */
  getRemainingPlaces(course: PlanningCourse): number {
    return course.capacity - course.participantsCount;
  }

  /** Peut-on réserver ce cours ? (simple : il reste des places) */
  canReserve(course: PlanningCourse): boolean {
    return this.getRemainingPlaces(course) > 0;
  }

  /** Action de réservation (pour l'instant : simple alert, on branchera sur /inscriptions après) */
  reserve(course: PlanningCourse): void {
    if (!this.canReserve(course)) return;

    // TODO: appeler un ReservationService + utilisateur connecté
    alert(`Réservation simulée pour le cours "${course.title}" à ${new Date(course.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
  }

  /** Filtre allCourses en fonction de selectedDate */
  private updateCoursesForSelectedDay(): void {
    if (!this.selectedDate) {
      this.coursesForSelectedDay = [];
      return;
    }

    const key = this.toDateKey(this.selectedDate);

    this.coursesForSelectedDay = this.allCourses.filter(
      (course) => this.toDateKey(new Date(course.start)) === key
    );
  }

  /** Normalisation de date sur la forme "YYYY-MM-DD" */
  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
