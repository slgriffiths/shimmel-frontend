import type { PagyResponse } from '@/hooks/usePagination';

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  last_run_at?: string | null;
  total_runs: number;
  account_id: number;
  account_name?: string;
  created_by_user_name?: string;
}

export type WorkflowsResponse = PagyResponse<Workflow> & {
  workflows: Workflow[];
};