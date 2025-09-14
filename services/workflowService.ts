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

  /**
   * Get paginated list of all workflows
   */
  static async getWorkflows(page = 1, limit = 20): Promise<WorkflowsResponse> {
    const { data } = await api.get('/workflows', {
      params: { page, limit }
    });
    return data;
  }

  /**
   * Get recent workflows for dashboard
   */
  static async getRecentWorkflows(page = 1, limit = 5): Promise<WorkflowsResponse> {
    const { data } = await api.get('/workflows', {
      params: { page, limit }
    });
    return data;
  }

  /**
   * Clone a workflow to another account
   */
  static async cloneWorkflow(workflowId: number, payload: { target_account_id?: number }): Promise<Workflow> {
    const { data } = await api.post(`/workflows/${workflowId}/clone`, payload);
    return data;
  }
}