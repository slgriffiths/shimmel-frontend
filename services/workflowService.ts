import { api } from '@/lib/api';
import type { Workflow, WorkflowsResponse } from '@/types/workflow';

export class WorkflowService {
  /**
   * Get paginated list of workflows for an account
   */
  static async getAccountWorkflows(accountId: number, page = 1, limit = 20): Promise<WorkflowsResponse> {
    const { data } = await api.get(`/accounts/${accountId}/workflows`, {
      params: { page, limit }
    });
    return data;
  }

  /**
   * Get a specific workflow
   */
  static async getWorkflow(workflowId: number): Promise<Workflow> {
    const { data } = await api.get(`/workflows/${workflowId}`);
    return data;
  }
}