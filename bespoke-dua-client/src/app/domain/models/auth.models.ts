export interface AuthUser {
  userId: number;
  username: string;
  email: string;
  plan: string;
  lastRequestDate: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
}
