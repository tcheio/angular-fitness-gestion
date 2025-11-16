import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../features/users/services/user.service';
import { PlanningService } from '../features/planning/services/planning.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  stats = {
    workouts: 0,
    users: 0,
    salles: 0,
  };

  constructor(
    private userService: UserService,
    private planningService: PlanningService
  ) {}

  ngOnInit(): void {
    this.planningService.getSalles().subscribe((salles) => {
      this.stats.salles = salles.length;
    });
    this.userService.getUsers().subscribe((users) => {
      this.stats.users = users.length;
    });
    this.planningService.getRawCourses().subscribe((workouts) => {
      this.stats.workouts = workouts.length;
    });
  }
  features = [
    {
      title: 'Suivi des entraînements',
      icon: 'pi pi-chart-line',
      description: 'Suivez vos performances et progressez',
    },
    {
      title: 'Plans personnalisés',
      icon: 'pi pi-user',
      description: 'Des programmes adaptés à vos objectifs',
    },
    {
      title: 'Statistiques',
      icon: 'pi pi-database',
      description: 'Analysez vos résultats en détail',
    },
  ];
}
