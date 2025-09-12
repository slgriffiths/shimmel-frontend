import { api } from '@/lib/api';
import type {
  InvitationDetails,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  ResetTokenValidation,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@/types/auth';

export class AuthService {
  /**
   * Get invitation details by token
   */
  static async getInvitationDetails(token: string): Promise<InvitationDetails> {
    const { data } = await api.get(`/invitations/${token}`);
    return data;
  }

  /**
   * Accept invitation and set password
   */
  static async acceptInvitation(
    token: string, 
    request: AcceptInvitationRequest
  ): Promise<AcceptInvitationResponse> {
    const { data } = await api.post(`/invitations/${token}/accept`, request);
    return data;
  }

  /**
   * Request password reset email
   */
  static async requestPasswordReset(request: PasswordResetRequest): Promise<PasswordResetResponse> {
    const { data } = await api.post('/password_resets', request);
    return data;
  }

  /**
   * Validate password reset token
   */
  static async validateResetToken(token: string): Promise<ResetTokenValidation> {
    const { data } = await api.get(`/password_resets/${token}`);
    return data;
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    token: string,
    request: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    const { data } = await api.put(`/password_resets/${token}`, request);
    return data;
  }
}