export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  role: string;
  userId: string;
  name: string;
}
