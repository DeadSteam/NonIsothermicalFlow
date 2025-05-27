import { User } from './User';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (username: string, password: string) => Promise<User>;
  signup: (username: string, password: string) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}; 