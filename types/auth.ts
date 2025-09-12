export interface InvitationDetails {
  email: string;
  first_name: string;
  last_name: string;
  account_name: string;
}

export interface AcceptInvitationRequest {
  password: string;
}

export interface AcceptInvitationResponse {
  message: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    account_id: number;
  };
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface ResetTokenValidation {
  email: string;
  token_valid: boolean;
}

export interface ResetPasswordRequest {
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}