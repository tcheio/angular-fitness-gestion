import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { forkJoin, map, Observable } from "rxjs";
import { User } from "../../../auth/auth.service";
import { environment } from "../../../../environments/environment";

export type Niveau = "beginner" | "intermediate" | "advanced";

export interface Cours {
  id: number;
  titre: string;
  description: string;
  profId: number;
  salleId: number;
  horaire: string; // ISO string
  duree: number; // minutes
  capacite: number;
  niveau?: Niveau;
}

export interface Salle {
  id: string | number;
  nom: string;
  adresse: string;
  ouverte: boolean;
}

export interface InscriptionCours {
  id: string | number;
  userId: string | number;
  coursId: string | number;
  dateInscription: string;
}

export interface PlanningCourse {
  id: number;
  profId: number;
  title: string;
  coach: string;
  start: string;
  end: string;
  room: string;
  level: Niveau;
  capacity: number;
  participantsCount: number;
  participantUserIds: (string | number)[];
  participants: string[];
}

@Injectable({
  providedIn: "root",
})
export class PlanningService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /* ========= CRUD COURS BRUTS ========= */

  getRawCourses(): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.API_URL}/cours`);
  }

  getCourseById(id: number): Observable<Cours> {
    return this.http.get<Cours>(`${this.API_URL}/cours/${id}`);
  }

  createCourse(payload: Omit<Cours, "id">): Observable<Cours> {
    return this.http.post<Cours>(`${this.API_URL}/cours`, payload);
  }

  updateCourse(id: number, payload: Omit<Cours, "id">): Observable<Cours> {
    return this.http.put<Cours>(`${this.API_URL}/cours/${id}`, payload);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/cours/${id}`);
  }

  /* ========= Salles & Profs ========= */

  getSalles(): Observable<Salle[]> {
    return this.http.get<Salle[]>(`${this.API_URL}/salles`);
  }

  getProfs(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users?role=prof`);
  }

  /* ========= Cours enrichis pour le planning / listes ========= */

  getPlanningCourses(): Observable<PlanningCourse[]> {
    const cours$ = this.getRawCourses();
    const salles$ = this.getSalles();
    const inscriptions$ = this.http.get<InscriptionCours[]>(
      `${this.API_URL}/inscription-cours`,
    );
    const users$ = this.http.get<User[]>(`${this.API_URL}/users`);

    return forkJoin({
      cours: cours$,
      salles: salles$,
      inscriptions: inscriptions$,
      users: users$,
    }).pipe(
      map(({ cours, salles, inscriptions, users }) =>
        cours.map((c) => {
          const startDate = new Date(c.horaire);
          const endDate = new Date(startDate.getTime() + c.duree * 60_000);

          const salle = salles.find((s) => s.id == c.salleId);

          const prof = users.find((u) => u.id == c.profId);
          const coach = prof
            ? `${prof.prenom} ${prof.nom}`
            : `Coach #${c.profId}`;

          const coursInscriptions = inscriptions.filter(
            (i) => i.coursId == c.id,
          );
          const participantUserIds = coursInscriptions.map((i) => i.userId);

          const participants = participantUserIds.map((id) => {
            const u = users.find((user) => user.id == id);
            return u ? `${u.prenom} ${u.nom}` : `Membre #${id}`;
          });

          return {
            id: c.id,
            profId: c.profId,
            title: c.titre,
            coach,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            room: salle ? salle.nom : `Salle #${c.salleId}`,
            level: c.niveau ?? this.inferLevel(c),
            capacity: c.capacite ?? 15,
            participantsCount: participantUserIds.length,
            participantUserIds,
            participants,
          } as PlanningCourse;
        }),
      ),
    );
  }

  private inferLevel(c: Cours): Niveau {
    const txt = `${c.titre} ${c.description}`.toLowerCase();
    if (txt.includes("débutant")) return "beginner";
    if (
      txt.includes("intensif") ||
      txt.includes("confirmé") ||
      txt.includes("avancé")
    ) {
      return "advanced";
    }
    return "intermediate";
  }
}
