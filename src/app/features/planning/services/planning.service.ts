import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { User } from '../../../models/user.model';

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

export interface PlanningCourse {
  id: number;
  title: string;
  coach: string;
  start: string; 
  end: string;   
  room: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  capacity: number;
  participantsCount: number;
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

      const salle = salles.find((s) => s.id === c.salleId);
      const prof = users.find((u) => u.id === c.profId);
      const coach = prof ? `${prof.prenom} ${prof.nom}` : `Coach #${c.profId}`;

      const participantsCount = inscriptions.filter(
        (i) => i.coursId === c.id
      ).length;

      return {
        id: c.id,
        title: c.titre,
        coach,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        room: salle ? salle.nom : `Salle #${c.salleId}`,
        level: this.inferLevel(c),
        capacity: c.capacite ?? 15,   // 👈 récupère la capacité du JSON (15 par défaut si manquant)
        participantsCount,
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
