export interface User {
  id: string;
  username: string;
  role: string;
  token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: string;
  username: string;
  roles: string[];
} 