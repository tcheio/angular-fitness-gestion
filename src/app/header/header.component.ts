import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [Menubar, RouterModule],
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/',
      },
      {
        label: 'Features',
        icon: 'pi pi-star',
        routerLink: '/features',
      },
      {
        label: 'Users',
        icon: 'pi pi-users',
        routerLink: '/users',
      },
      {
        label: 'Projects',
        icon: 'pi pi-search',
        items: [
          {
            label: 'Components',
            icon: 'pi pi-bolt',
            routerLink: '/components',
          },
          {
            label: 'Blocks',
            icon: 'pi pi-server',
            routerLink: '/blocks',
          },
          {
            label: 'UI Kit',
            icon: 'pi pi-pencil',
            routerLink: '/ui',
          },
          {
            label: 'Templates',
            icon: 'pi pi-palette',
            items: [
              {
                label: 'Apollo',
                icon: 'pi pi-palette',
                routerLink: '/apollo',
              },
              {
                label: 'Ultima',
                icon: 'pi pi-palette',
                routerLink: '/ultima',
              },
            ],
          },
        ],
      },
      {
        label: 'Contact',
        icon: 'pi pi-envelope',
        routerLink: '/contact',
      },
    ];
  }
}
