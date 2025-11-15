export interface Course {
  id?: number;
  titre: string;
  description: string;
  profId: number;
  salleId: number;
  horaire: string; // ISO string type "2025-10-18T09:00:00"
  duree: number;   // en minutes
}
