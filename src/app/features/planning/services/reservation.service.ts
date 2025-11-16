import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InscriptionCours } from './planning.service';
import { environment } from '../../../../environments/environment';
import { PlanningService, PlanningCourse } from './planning.service';
import { forkJoin, map } from 'rxjs';

interface ListItem extends PlanningCourse {
  subscriptionId?: string | number;
}

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly API_URL = `${environment.apiUrl}/inscription-cours`;

  constructor(
    private http: HttpClient,
    private planningService: PlanningService
  ) {}

  getInscriptionsByUser(
    userId: string | number
  ): Observable<InscriptionCours[]> {
    return this.http.get<InscriptionCours[]>(
      `${this.API_URL}?userId=${userId}`
    );
  }

  getCoursesForUser(userId: string | number): Observable<ListItem[]> {
    return forkJoin({
      inscriptions: this.getInscriptionsByUser(userId),
      planningCourses: this.planningService.getPlanningCourses(),
    }).pipe(
      map(
        ({
          inscriptions = [],
          planningCourses = [],
        }: {
          inscriptions: InscriptionCours[];
          planningCourses: ListItem[];
        }) => {
          // regrouper les inscriptions par coursId pour lookup rapide
          const insByCourse = new Map<string, InscriptionCours[]>();
          inscriptions.forEach((ins) => {
            const key = String(ins.coursId);
            const arr = insByCourse.get(key);
            if (arr) arr.push(ins);
            else insByCourse.set(key, [ins]);
          });

          // ne garder que les planningCourses réservés et ajouter subscriptionId
          return planningCourses
            .filter((pc) => insByCourse.has(String(pc.id)))
            .map((pc) => {
              const insList = insByCourse.get(String(pc.id)) || [];
              const subscriptionId = insList.length ? insList[0].id : undefined;
              return { ...pc, subscriptionId } as ListItem;
            });
        }
      )
    );
  }

  addInscription(
    payload: Omit<InscriptionCours, 'id'>
  ): Observable<InscriptionCours> {
    return this.http.post<InscriptionCours>(this.API_URL, payload);
  }

  deleteInscription(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
