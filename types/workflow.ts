import type { PagyResponse } from '@/hooks/usePagination';

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  last_ran_at?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
  triggers: any[];
  actions: any[];
}

export type WorkflowsResponse = PagyResponse<Workflow> & {
  workflows: Workflow[];
};