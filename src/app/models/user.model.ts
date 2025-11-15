export type UserRole = 'member' | 'coach' | 'admin';

export interface User {
  id?: number;         
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
  salleId: number;
}

