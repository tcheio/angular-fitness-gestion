import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { PlanningService, PlanningCourse } from '../../services/planning.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-planning-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './planning-calendar.component.html',
  styleUrls: ['./planning-calendar.component.scss'],
})
export class PlanningCalendarComponent implements OnInit {
  /** Tous les cours (après filtrage par rôle) */
  allCourses: PlanningCourse[] = [];

  /** Date sélectionnée dans le calendrier */
  selectedDate: Date | null = new Date();

  /** Cours filtrés pour la date sélectionnée */
  coursesForSelectedDay: PlanningCourse[] = [];

  isAdmin = false;
  isProf = false;
  isAdherent = false;
  currentUserId: string | number | null = null;

  constructor(
    private planningService: PlanningService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.auth.getCurrentUser();
    if (currentUser) {
      this.currentUserId = currentUser.id;
      this.isAdmin = this.auth.isAdmin();
      this.isProf = this.auth.isProf();
      this.isAdherent = this.auth.isAdherent();
    }

    this.planningService.getPlanningCourses().subscribe((courses) => {
      let filtered = courses;

      // ADMIN → voit tous les cours, aucun filtre
      if (this.isAdmin) {
        filtered = courses;
      }
      // PROF → uniquement ses cours (profId == user.id, même si string/number)
      else if (this.isProf && this.currentUserId != null) {
        filtered = courses.filter(
          (c) => c.profId == this.currentUserId 
        );
      }
      // ADHERENT → uniquement les cours où il est inscrit
      else if (this.isAdherent && this.currentUserId != null) {
        filtered = courses.filter((c) =>
          c.participantUserIds.some(
            (uid) => uid == this.currentUserId 
          )
        );
      }

      this.allCourses = filtered;
      this.updateCoursesForSelectedDay();
    });
  }

  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.updateCoursesForSelectedDay();
  }

  hasCourse(dateMeta: any): boolean {
    if (!dateMeta) return false;
    const cellDate = new Date(dateMeta.year, dateMeta.month, dateMeta.day);
    const cellKey = this.toDateKey(cellDate);

    return this.allCourses.some(
      (course) => this.toDateKey(new Date(course.start)) === cellKey
    );
  }

  getRemainingPlaces(course: PlanningCourse): number {
    return course.capacity - course.participantsCount;
  }

  canReserve(course: PlanningCourse): boolean {
    return this.getRemainingPlaces(course) > 0 && this.isAdherent;
  }

  reserve(course: PlanningCourse): void {
    if (!this.canReserve(course) || !this.currentUserId) return;

    alert(
      `Réservation simulée pour "${course.title}" à ${
        new Date(course.start).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      }`
    );
  }

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

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
