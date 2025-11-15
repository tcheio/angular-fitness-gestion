import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { User } from '../../../auth/auth.service';

export interface Cours {
  id: number;
  titre: string;
  description: string;
  profId: number;
  salleId: number;
  horaire: string;
  duree: number;
  capacite: number;
}

export interface Salle {
  id: number;
  nom: string;
  adresse: string;
  ouverte: boolean;
}

export interface Inscription {
  id: number;
  userId: number;
  coursId: number;
  dateInscription: string;
}

/** utilisé par le component + template */
export interface PlanningCourse {
  id: number;
  profId: number;
  title: string;
  coach: string;
  start: string;
  end: string;
  room: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  capacity: number;
  participantsCount: number;
  participantUserIds: number[];
  participants: string[];
}

@Injectable({
  providedIn: 'root',
})
export class PlanningService {
  private readonly API_URL = 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  getPlanningCourses(): Observable<PlanningCourse[]> {
    const cours$ = this.http.get<Cours[]>(`${this.API_URL}/cours`);
    const salles$ = this.http.get<Salle[]>(`${this.API_URL}/salles`);
    const inscriptions$ = this.http.get<Inscription[]>(
      `${this.API_URL}/inscriptions`
    );
    const users$ = this.http.get<User[]>(`${this.API_URL}/users`);

    return forkJoin({ cours: cours$, salles: salles$, inscriptions: inscriptions$, users: users$ }).pipe(
      map(({ cours, salles, inscriptions, users }) =>
        cours.map((c) => {
          const startDate = new Date(c.horaire);
          const endDate = new Date(startDate.getTime() + c.duree * 60_000);

          const salle = salles.find((s) => s.id == c.salleId);
          const prof = users.find((u) => u.id == c.profId);

          const courseInscriptions = inscriptions.filter(
            (i) => i.coursId === c.id
          );
          const participantUserIds = courseInscriptions.map((i) => i.userId);
          const participants = participantUserIds.map((id) => {
            const u = users.find((user) => user.id === id);
            return u ? `${u.prenom} ${u.nom}` : `Membre #${id}`;
          });

          return {
            id: c.id,
            profId: c.profId,
            title: c.titre,
            coach: prof ? `${prof.prenom} ${prof.nom}` : `Coach #${c.profId}`,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            room: salle ? salle.nom : `Salle #${c.salleId}`,
            level: this.inferLevel(c),
            capacity: c.capacite ?? 15,
            participantsCount: participantUserIds.length,
            participantUserIds,
            participants,
          } as PlanningCourse;
        })
      )
    );
  }

  private inferLevel(c: Cours): 'beginner' | 'intermediate' | 'advanced' {
    const txt = `${c.titre} ${c.description}`.toLowerCase();
    if (txt.includes('débutant')) return 'beginner';
    if (txt.includes('intensif') || txt.includes('confirmé') || txt.includes('avancé')) {
      return 'advanced';
    }
    return 'intermediate';
  }
}
