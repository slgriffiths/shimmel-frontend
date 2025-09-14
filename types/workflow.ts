import type { PagyResponse } from '@/hooks/usePagination';

export interface Workflow {
  total_runs: number;
  owner: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  status: string;
  id: number;
  name: string;
  description?: string;
  last_ran_at?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
  triggers: any[];
  actions: any[];
  account_id?: number;
  account_name?: string;
  account?: {
    id: number;
    name: string;
  };
}

export type WorkflowsResponse = PagyResponse<Workflow> & {
  workflows: Workflow[];
};
