import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  features = [
    {
      title: 'Suivi des entraînements',
      icon: 'pi pi-chart-line',
      description: 'Suivez vos performances et progressez'
    },
    {
      title: 'Plans personnalisés',
      icon: 'pi pi-user',
      description: 'Des programmes adaptés à vos objectifs'
    },
    {
      title: 'Statistiques',
      icon: 'pi pi-database',
      description: 'Analysez vos résultats en détail'
    }
  ];

  stats = {
    workouts: 1250,
    users: 350,
    goals: 890
  };
}
