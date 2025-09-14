import type { PagyResponse } from '@/hooks/usePagination';

export interface SupportTicket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'completed';
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  account: {
    id: number;
    name: string;
  };
  responses?: SupportTicketResponse[];
  response_count: number;
}

export interface SupportTicketResponse {
  id: number;
  message: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
  };
}

export interface CreateSupportTicketRequest {
  title: string;
  description: string;
}

export interface UpdateSupportTicketRequest {
  status: 'open' | 'closed' | 'completed';
}

export interface CreateSupportTicketResponseRequest {
  message: string;
}

export type SupportTicketsResponse = PagyResponse<SupportTicket> & {
  support_tickets: SupportTicket[];
};