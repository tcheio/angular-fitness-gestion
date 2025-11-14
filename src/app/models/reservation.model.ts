export interface Reservation {
  id: number;
  userId: number;      // Id de l'utilisateur (pour l'instant on simulera)
  courseId: number;    // Id du cours réservé
  createdAt: Date;
}
