import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, Menubar],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] = [];
  userLabel = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.userLabel = user ? `${user.prenom} ${user.nom}` : '';

    const baseItems: MenuItem[] = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/home',
      },
      {
        label: 'Planning',
        icon: 'pi pi-calendar',
        routerLink: '/planning',
      },
    ];

    // Users visible uniquement pour admin
    if (this.auth.isAdmin()) {
      baseItems.splice(1, 0, {
        label: 'Users',
        icon: 'pi pi-users',
        routerLink: '/users',
      });
    }

    this.items = [
      ...baseItems,
      {
        label: this.userLabel || 'Compte',
        icon: 'pi pi-user',
        items: [
          {
            label: 'Déconnexion',
            icon: 'pi pi-sign-out',
            command: () => this.auth.logout(),
            routerLink: '/login',
          },
        ],
      },
    ];
  }
}
