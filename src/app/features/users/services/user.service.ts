import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _users$ = new BehaviorSubject<User[]>([
    {
      id: 1,
      firstName: 'Lucas',
      lastName: 'Labeÿe',
      email: 'lucas@example.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2024-01-10'),
    },
    {
      id: 2,
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie.coach@example.com',
      role: 'coach',
      isActive: true,
      createdAt: new Date('2024-02-05'),
    },
    {
      id: 3,
      firstName: 'Yanis',
      lastName: 'Durand',
      email: 'yanis.member@example.com',
      role: 'member',
      isActive: false,
      createdAt: new Date('2024-03-15'),
    },
  ]);

  get users$(): Observable<User[]> {
    return this._users$.asObservable();
  }

  get snapshot(): User[] {
    return this._users$.value;
  }

  addUser(data: Omit<User, 'id' | 'createdAt'>): void {
    const users = this.snapshot;
    const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;

    const newUser: User = {
      ...data,
      id: newId,
      createdAt: new Date(),
    };

    this._users$.next([...users, newUser]);
  }

  updateUser(id: number, patch: Partial<User>): void {
    const updated = this.snapshot.map(u =>
      u.id === id ? { ...u, ...patch } : u
    );
    this._users$.next(updated);
  }

  deleteUser(id: number): void {
    this._users$.next(this.snapshot.filter(u => u.id !== id));
  }

  getUserById(id: number): User | undefined {
    return this.snapshot.find(u => u.id === id);
  }

  get roles(): UserRole[] {
    return ['member', 'coach', 'admin'];
  }
}
