import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlanningCourse, PlanningService } from '../../services/planning.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.scss'],
})
export class CourseListComponent implements OnInit {
  courses: PlanningCourse[] = [];

  isAdmin = false;
  isProf = false;
  currentUserId: string | number | null = null;
  sortMode: 'date-asc' | 'date-desc' | 'level' = 'date-asc';

  constructor(
    private planningService: PlanningService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.currentUserId = user.id;
    this.isAdmin = this.auth.isAdmin();
    this.isProf = this.auth.isProf();

    this.loadCourses();
  }

  loadCourses(): void {
    this.planningService.getPlanningCourses().subscribe((courses) => {
      let filtered = courses;
      if (this.isProf && this.currentUserId != null && !this.isAdmin) {
        filtered = courses.filter((c) => c.profId == this.currentUserId);
      }

      this.courses = filtered;
      this.applySort(); 
    });
  }

  applySort(): void {
    const sorted = [...this.courses];

    if (this.sortMode === 'date-asc' || this.sortMode === 'date-desc') {
      sorted.sort((a, b) => {
        const da = new Date(a.start).getTime();
        const db = new Date(b.start).getTime();
        return this.sortMode === 'date-asc' ? da - db : db - da;
      });
    } else if (this.sortMode === 'level') {
      const order: Record<string, number> = {
        beginner: 0,
        intermediate: 1,
        advanced: 2,
      };
      sorted.sort((a, b) => (order[a.level] ?? 99) - (order[b.level] ?? 99));
    }

    this.courses = sorted;
  }

  create(): void {
    this.router.navigate(['/cours/new']);
  }

  edit(courseId: number): void {
    this.router.navigate(['/cours', courseId, 'edit']);
  }

  delete(courseId: number): void {
    if (!confirm('Supprimer ce cours ?')) return;

    this.planningService.deleteCourse(courseId).subscribe(() => {
      this.loadCourses();
    });
  }
}
