export type AppUserRole = 'user' | 'admin';

export type AuthUser = {
  username: string;
  role: AppUserRole;
};
