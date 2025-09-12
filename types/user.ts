import type { PagyResponse } from '@/hooks/usePagination';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'user';
  disabled_at?: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string | null;
  account_id: number;
  account_name?: string;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'user'; // Always required - either 'admin' or 'user'
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: 'admin' | 'user'; // Either 'admin' or 'user'
  disabled_at?: null;
}

export type UsersResponse = PagyResponse<User> & {
  users: User[];
};