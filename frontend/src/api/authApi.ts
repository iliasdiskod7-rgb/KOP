import { apiPost } from './httpClient';
import type { LoginRequest, LoginResponse } from './types';

export function login(request: LoginRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse, LoginRequest>('/api/auth/login', request, false);
}
