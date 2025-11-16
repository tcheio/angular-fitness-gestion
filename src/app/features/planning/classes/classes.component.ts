import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { PlanningCourse, InscriptionCours } from '../services/planning.service';
import { AuthService } from '../../../auth/auth.service';
import { ReservationService } from '../services/reservation.service';

interface ListItem extends PlanningCourse {
  subscriptionId?: string | number;
}

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss'],
})
export class ClassesComponent implements OnInit {
  /** Tous les cours (après filtrage par rôle) */
  allCourses: PlanningCourse[] = [];

  /** Date sélectionnée dans le calendrier */
  selectedDate: Date | null = new Date();

  currentUserId: string | number | null = null;

  constructor(
    private auth: AuthService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    const currentUser = this.auth.getCurrentUser();
    if (currentUser) {
      this.currentUserId = currentUser.id;
    }

    this.loadCourses();
  }

  loadCourses(): void {
    this.reservationService.getCoursesForUser(this.currentUserId!).subscribe({
      next: (courses: PlanningCourse[]) => {
        this.allCourses = courses || [];
      },
      error: () => {
        this.allCourses = [];
      },
    });
  }

  cancelReservation(course: ListItem): void {
    if (!course.subscriptionId) return;

    this.reservationService
      .deleteInscription(course.subscriptionId)
      .subscribe(() => {
        this.loadCourses();
      });
  }
}
