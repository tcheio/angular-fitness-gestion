import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DatePicker } from "primeng/datepicker";
import {
  PlanningService,
  PlanningCourse,
} from "../../services/planning.service";
import { AuthService } from "../../../../auth/auth.service";
import { ReservationService } from "../../services/reservation.service";
import { forkJoin } from "rxjs";

interface CalendarCourse extends PlanningCourse {
  isSubscribed?: boolean;
  subscriptionId?: string | number;
}

@Component({
  selector: "app-planning-calendar",
  standalone: true,
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: "./planning-calendar.component.html",
  styleUrls: ["./planning-calendar.component.scss"],
})
export class PlanningCalendarComponent implements OnInit {
  /** Tous les cours (après filtrage par rôle) */
  allCourses: CalendarCourse[] = [];

  /** Date sélectionnée dans le calendrier */
  selectedDate: Date | null = new Date();

  /** Cours filtrés pour la date sélectionnée */
  coursesForSelectedDay: CalendarCourse[] = [];

  isAdmin = false;
  isProf = false;
  isAdherent = false;
  currentUserId: string | number | null = null;

  constructor(
    private planningService: PlanningService,
    private auth: AuthService,
    private reservationService: ReservationService,
  ) {}

  ngOnInit(): void {
    const currentUser = this.auth.getCurrentUser();
    if (currentUser) {
      this.currentUserId = currentUser.id;
      this.isAdmin = this.auth.isAdmin();
      this.isProf = this.auth.isProf();
      this.isAdherent = this.auth.isAdherent();
    }

    this.loadCourses();
  }

  loadCourses(): void {
    const courses$ = this.planningService.getPlanningCourses();

    if (this.isAdherent && this.currentUserId) {
      const inscriptions$ = this.reservationService.getInscriptionsByUser(
        this.currentUserId,
      );

      forkJoin([courses$, inscriptions$]).subscribe(
        ([courses, inscriptions]) => {
          this.allCourses = courses.map((course) => {
            const inscription = inscriptions.find(
              (i) => i.coursId === course.id,
            );
            return {
              ...course,
              isSubscribed: !!inscription,
              subscriptionId: inscription?.id,
            };
          });
          this.updateCoursesForSelectedDay();
        },
      );
    } else {
      courses$.subscribe((courses) => {
        let filtered = courses;
        if (this.isProf && this.currentUserId != null) {
          filtered = courses.filter((c) => c.profId == this.currentUserId);
        }
        this.allCourses = filtered;
        this.updateCoursesForSelectedDay();
      });
    }
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
      (course) => this.toDateKey(new Date(course.start)) === cellKey,
    );
  }

  getRemainingPlaces(course: PlanningCourse): number {
    return course.capacity - course.participantsCount;
  }

  canReserve(course: CalendarCourse): boolean {
    return (
      this.getRemainingPlaces(course) > 0 &&
      this.isAdherent &&
      !course.isSubscribed
    );
  }

  reserve(course: PlanningCourse): void {
    if (!this.canReserve(course) || !this.currentUserId) return;

    const payload = {
      coursId: course.id,
      userId: this.currentUserId as number,
      dateInscription: new Date().toISOString(),
    };

    this.reservationService.addInscription(payload).subscribe(() => {
      this.loadCourses();
    });
  }

  cancelReservation(course: CalendarCourse): void {
    if (!course.isSubscribed || !course.subscriptionId) return;

    this.reservationService
      .deleteInscription(course.subscriptionId)
      .subscribe(() => {
        this.loadCourses();
      });
  }

  private updateCoursesForSelectedDay(): void {
    if (!this.selectedDate) {
      this.coursesForSelectedDay = [];
      return;
    }

    const key = this.toDateKey(this.selectedDate);

    this.coursesForSelectedDay = this.allCourses.filter(
      (course) => this.toDateKey(new Date(course.start)) === key,
    );
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
