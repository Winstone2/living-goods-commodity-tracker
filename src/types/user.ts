export interface User {
  id: number;
  version: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER' |'CHA' | 'MANAGER' | 'CHP';
  createdAt: string;
  lastLogin: string | null;
  resetToken: string | null;
  resetTokenExpiry: string | null;
}