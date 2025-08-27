// Types for Run History components
export interface WorkflowRun {
  id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  workflow_id: number;
  workflow_name: string;
  steps_count: number;
  created_at: string;
  input_data: {
    trigger: {
      type: string;
      id: number;
      name: string;
      data: Record<string, any>;
      config: {
        fields: Array<{
          name: string;
          label: string;
          type: string;
          required: boolean;
        }>;
        success_message?: string;
        redirect_url?: string;
      };
    };
  };
  current_step?: number;
  total_steps: number;
  progress_percentage: number;
  steps: RunStep[];
}

export interface RunStep {
  step_number: number;
  action_name: string;
  action_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  duration?: number;
  error_message?: string;
  output_data?: any;
}
