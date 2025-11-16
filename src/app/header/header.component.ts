import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { AuthService, User } from '../auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, Menubar],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  items: MenuItem[] = [];
  userLabel = '';
  private unsubscribe$ = new Subject<void>();

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.currentUser$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.updateUser(user);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private updateUser(user: User | null): void {
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

    if (user && (this.auth.isAdmin() || this.auth.isProf())) {
      baseItems.splice(2, 0, {
        label: 'Cours',
        icon: 'pi pi-book',
        items: [
          {
            label: 'Liste des cours',
            icon: 'pi pi-list',
            routerLink: '/cours',
          },
          {
            label: 'Nouveau cours',
            icon: 'pi pi-plus',
            routerLink: '/cours/new',
          },
        ],
      });
    }

    if (user && this.auth.isAdmin()) {
      baseItems.splice(1, 0, {
        label: 'Users',
        icon: 'pi pi-users',
        routerLink: '/users',
      });
    }

    if (user && this.auth.isAdherent()) {
      baseItems.push({
        label: 'Mes Cours',
        icon: 'pi pi-bookmark',
        routerLink: '/cours/mine',
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
