import { User } from './User';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<User>;
  signup: (username: string, password: string) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
} 