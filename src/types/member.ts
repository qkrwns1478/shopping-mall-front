export interface Member {
  id: number;
  email: string;
  name: string;
  address: string;
  role: 'USER' | 'ADMIN';
  points: number;
}