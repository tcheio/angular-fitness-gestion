import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { InscriptionCours } from "./planning.service";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ReservationService {
  private readonly API_URL = `${environment.apiUrl}/inscription-cours`;

  constructor(private http: HttpClient) {}

  getInscriptionsByUser(
    userId: string | number,
  ): Observable<InscriptionCours[]> {
    return this.http.get<InscriptionCours[]>(
      `${this.API_URL}?userId=${userId}`,
    );
  }

  addInscription(
    payload: Omit<InscriptionCours, "id">,
  ): Observable<InscriptionCours> {
    return this.http.post<InscriptionCours>(this.API_URL, payload);
  }

  deleteInscription(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
