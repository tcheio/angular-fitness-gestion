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
        routerLink: '/home',
      },
      {
        label: 'Users',
        icon: 'pi pi-users',
        routerLink: '/users',
      },
      {
        label: 'Planning',
        icon: 'pi pi-calendar',
        routerLink: '/planning',
      },
    ];
  }
}
