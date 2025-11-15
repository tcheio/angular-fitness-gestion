import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Inscription {
  id?: number;
  userId: number;
  coursId: number;
  dateInscription: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly API_URL = 'http://localhost:3001/inscriptions';

  constructor(private http: HttpClient) {}

  getInscriptionsByUser(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.API_URL}?userId=${userId}`);
  }

  addInscription(payload: Omit<Inscription, 'id'>): Observable<Inscription> {
    return this.http.post<Inscription>(this.API_URL, payload);
  }

  deleteInscription(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
