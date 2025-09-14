import { api } from '@/lib/api';
import type { 
  SupportTicket, 
  SupportTicketsResponse, 
  CreateSupportTicketRequest,
  UpdateSupportTicketRequest,
  SupportTicketResponse,
  CreateSupportTicketResponseRequest
} from '@/types/supportTicket';

export class SupportTicketService {
  /**
   * Get paginated list of support tickets (user's own tickets or all if super admin)
   */
  static async getSupportTickets(page = 1, limit = 20): Promise<SupportTicketsResponse> {
    const { data } = await api.get('/support_tickets', {
      params: { page, limit }
    });
    return data;
  }

  /**
   * Get a specific support ticket with all responses
   */
  static async getSupportTicket(ticketId: number): Promise<SupportTicket> {
    const { data } = await api.get(`/support_tickets/${ticketId}`);
    return data;
  }

  /**
   * Create a new support ticket
   */
  static async createSupportTicket(ticketData: CreateSupportTicketRequest): Promise<SupportTicket> {
    const { data } = await api.post('/support_tickets', ticketData);
    return data;
  }

  /**
   * Update support ticket status (super admin only)
   */
  static async updateSupportTicket(
    ticketId: number, 
    updateData: UpdateSupportTicketRequest
  ): Promise<SupportTicket> {
    const { data } = await api.put(`/support_tickets/${ticketId}`, updateData);
    return data;
  }

  /**
   * Get responses for a support ticket
   */
  static async getSupportTicketResponses(ticketId: number): Promise<SupportTicketResponse[]> {
    const { data } = await api.get(`/support_tickets/${ticketId}/responses`);
    return data;
  }

  /**
   * Add a response to a support ticket
   */
  static async createSupportTicketResponse(
    ticketId: number, 
    responseData: CreateSupportTicketResponseRequest
  ): Promise<SupportTicketResponse> {
    const { data } = await api.post(`/support_tickets/${ticketId}/responses`, responseData);
    return data;
  }
}