import { api } from '@/lib/api';
import type { Agent } from '@/contexts/ConfigurationContext';
import type { PagyResponse } from '@/hooks/usePagination';

export type AccountAgentsResponse = PagyResponse<Agent> & {
  agents: Agent[];
};

export class AccountAgentService {
  /**
   * Get paginated list of agents for an account
   */
  static async getAccountAgents(accountId: number, page = 1, limit = 20): Promise<AccountAgentsResponse> {
    const { data } = await api.get(`/accounts/${accountId}/agents`, {
      params: { page, limit }
    });
    return data;
  }

  /**
   * Get a specific agent
   */
  static async getAgent(agentId: number): Promise<Agent> {
    const { data } = await api.get(`/agents/${agentId}`);
    return data;
  }
}