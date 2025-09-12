import { api } from '@/lib/api';
import type { User, UsersResponse, CreateUserRequest, UpdateUserRequest } from '@/types/user';

export class UserService {
  /**
   * Get paginated list of users for an account
   */
  static async getUsers(accountId: number, page = 1, limit = 20): Promise<UsersResponse> {
    const { data } = await api.get(`/accounts/${accountId}/users`, {
      params: { page, limit }
    });
    return data;
  }

  /**
   * Get a specific user
   */
  static async getUser(accountId: number, userId: number): Promise<User> {
    const { data } = await api.get(`/accounts/${accountId}/users/${userId}`);
    return data;
  }

  /**
   * Create a new user
   */
  static async createUser(accountId: number, userData: CreateUserRequest): Promise<User> {
    const { data } = await api.post(`/accounts/${accountId}/users`, userData);
    return data;
  }

  /**
   * Update a user
   */
  static async updateUser(accountId: number, userId: number, userData: UpdateUserRequest): Promise<User> {
    const { data } = await api.put(`/accounts/${accountId}/users/${userId}`, userData);
    return data;
  }

  /**
   * Disable a user
   */
  static async disableUser(accountId: number, userId: number): Promise<void> {
    await api.delete(`/accounts/${accountId}/users/${userId}`);
  }

  /**
   * Enable a user
   */
  static async enableUser(accountId: number, userId: number): Promise<User> {
    const { data } = await api.put(`/accounts/${accountId}/users/${userId}`, {
      disabled_at: null
    });
    return data;
  }

  /**
   * Resend invitation to a user
   */
  static async resendInvitation(accountId: number, userId: number): Promise<void> {
    await api.post(`/accounts/${accountId}/users/${userId}/resend_invitation`);
  }
}