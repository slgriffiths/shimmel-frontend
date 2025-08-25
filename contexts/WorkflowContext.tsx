'use client';

import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';
import { message as antdMessage } from 'antd';

// Types - backend will provide trigger/action definitions
export interface WorkflowTrigger {
  id: string;
  type: string;
  name?: string;
  description?: string;
  config: Record<string, any>;
  position: number;
  form_fields?: any[];
  enabled?: boolean;
}

export interface WorkflowAction {
  id: string;
  type: string;
  name?: string;
  description?: string;
  config: Record<string, any>;
  position: number;
  enabled?: boolean;
}

export interface TriggerType {
  type: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
  supports_form_fields?: boolean;
  config_schema: {
    type: string;
    properties: Record<string, any>;
  };
}

export interface ActionType {
  type: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
  supports_form_fields?: boolean;
  config_schema: {
    type: string;
    properties: Record<string, any>;
  };
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  available_llm_models?: Array<{
    id?: string;
    value?: string;
    name?: string;
    label?: string;
    description?: string;
  }>;
  created_at: string;
  updated_at: string;
}

// Reducer action types
type WorkflowContextAction =
  | { type: 'SET_WORKFLOW'; payload: Workflow }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_TRIGGER'; payload: { triggerId: string; updates: Partial<WorkflowTrigger> } }
  | { type: 'UPDATE_ACTION'; payload: { actionId: string; updates: Partial<WorkflowAction> } }
  | { type: 'ADD_TRIGGER'; payload: WorkflowTrigger }
  | { type: 'ADD_ACTION'; payload: WorkflowAction }
  | { type: 'DELETE_TRIGGER'; payload: string }
  | { type: 'DELETE_ACTION'; payload: string }
  | { type: 'UPDATE_WORKFLOW_META'; payload: Partial<Pick<Workflow, 'name' | 'description' | 'status'>> }
  | { type: 'SET_SELECTED_STEP'; payload: (WorkflowTrigger | WorkflowAction) | null }
  | { type: 'SET_TRIGGER_TYPES'; payload: TriggerType[] }
  | { type: 'SET_ACTION_TYPES'; payload: ActionType[] };

// State type
interface WorkflowState {
  workflow: Workflow | null;
  loading: boolean;
  error: string | null;
  selectedStep: (WorkflowTrigger | WorkflowAction) | null;
  triggerTypes: TriggerType[];
  actionTypes: ActionType[];
}

// Initial state
const initialState: WorkflowState = {
  workflow: null,
  loading: false,
  error: null,
  selectedStep: null,
  triggerTypes: [],
  actionTypes: [],
};

// Reducer
function workflowReducer(state: WorkflowState, action: WorkflowContextAction): WorkflowState {
  switch (action.type) {
    case 'SET_WORKFLOW':
      return {
        ...state,
        workflow: action.payload,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'UPDATE_TRIGGER':
      if (!state.workflow) return state;
      return {
        ...state,
        workflow: {
          ...state.workflow,
          triggers: state.workflow.triggers.map(trigger =>
            trigger.id === action.payload.triggerId
              ? { ...trigger, ...action.payload.updates }
              : trigger
          ),
        },
      };
    case 'UPDATE_ACTION':
      if (!state.workflow) return state;
      return {
        ...state,
        workflow: {
          ...state.workflow,
          actions: state.workflow.actions.map(workflowAction =>
            workflowAction.id === action.payload.actionId
              ? { ...workflowAction, ...action.payload.updates }
              : workflowAction
          ),
        },
      };
    case 'ADD_TRIGGER':
      if (!state.workflow) return state;
      return {
        ...state,
        workflow: {
          ...state.workflow,
          triggers: [...(state.workflow.triggers || []), action.payload].sort((a, b) => a.position - b.position),
        },
      };
    case 'ADD_ACTION':
      if (!state.workflow) return state;
      return {
        ...state,
        workflow: {
          ...state.workflow,
          actions: [...(state.workflow.actions || []), action.payload].sort((a, b) => a.position - b.position),
        },
      };
    case 'DELETE_TRIGGER':
      if (!state.workflow) return state;
      return {
        ...state,
        workflow: {
          ...state.workflow,
          triggers: (state.workflow.triggers || []).filter(trigger => trigger.id !== action.payload),
        },
      };
    case 'DELETE_ACTION':
      if (!state.workflow) return state;
      return {
        ...state,
        workflow: {
          ...state.workflow,
          actions: (state.workflow.actions || []).filter(workflowAction => workflowAction.id !== action.payload),
        },
      };
    case 'UPDATE_WORKFLOW_META':
      if (!state.workflow) return state;
      return {
        ...state,
        workflow: {
          ...state.workflow,
          ...action.payload,
        },
      };
    case 'SET_SELECTED_STEP':
      return {
        ...state,
        selectedStep: action.payload,
      };
    case 'SET_TRIGGER_TYPES':
      return {
        ...state,
        triggerTypes: action.payload,
      };
    case 'SET_ACTION_TYPES':
      return {
        ...state,
        actionTypes: action.payload,
      };
    default:
      return state;
  }
}

// Context type
interface WorkflowContextType {
  state: WorkflowState;
  fetchWorkflow: (id: string) => Promise<void>;
  fetchTriggerAndActionTypes: () => Promise<void>;
  saveWorkflow: () => Promise<void>;
  updateTrigger: (triggerId: string, updates: Partial<WorkflowTrigger>) => void;
  updateAction: (actionId: string, updates: Partial<WorkflowAction>) => void;
  addTrigger: (trigger: Omit<WorkflowTrigger, 'id' | 'position'>) => void;
  addAction: (action: Omit<WorkflowAction, 'id' | 'position'>) => void;
  deleteTrigger: (triggerId: string) => void;
  deleteAction: (actionId: string) => void;
  updateWorkflowMeta: (updates: Partial<Pick<Workflow, 'name' | 'description' | 'status'>>) => void;
  setSelectedStep: (step: (WorkflowTrigger | WorkflowAction) | null) => void;
}

// Create context
const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// Provider component
interface WorkflowProviderProps {
  children: ReactNode;
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  const fetchWorkflow = useCallback(async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.get(`/workflows/${id}`);
      dispatch({ type: 'SET_WORKFLOW', payload: data });
    } catch (err) {
      console.error('Failed to fetch workflow:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load workflow' });
      antdMessage.error('Error loading workflow.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchTriggerAndActionTypes = useCallback(async () => {
    try {
      const [triggerTypesResponse, actionTypesResponse] = await Promise.all([
        api.get('/workflow_trigger_types'),
        api.get('/workflow_action_types')
      ]);
      
      dispatch({ type: 'SET_TRIGGER_TYPES', payload: triggerTypesResponse.data });
      dispatch({ type: 'SET_ACTION_TYPES', payload: actionTypesResponse.data });
    } catch (err) {
      console.error('Failed to fetch trigger and action types:', err);
      antdMessage.error('Error loading workflow types.');
    }
  }, []);

  const saveWorkflow = async () => {
    if (!state.workflow) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Transform triggers to match backend format
      const triggersAttributes = (state.workflow.triggers || []).map(trigger => ({
        id: typeof trigger.id === 'string' && trigger.id.startsWith('trigger_') ? undefined : trigger.id,
        type: trigger.type, // Use full class name
        name: trigger.name,
        description: trigger.description,
        enabled: trigger.enabled !== undefined ? trigger.enabled : true,
        config: trigger.config || {},
        // Handle form fields for Form triggers
        ...(trigger.type === 'Workflow::Trigger::Form' && trigger.form_fields ? {
          form_fields_attributes: trigger.form_fields.map((field: any) => ({
            id: typeof field.id === 'string' ? undefined : field.id,
            field_type: field.type, // Use field_type instead of type
            name: field.name,
            label: field.label,
            placeholder: field.placeholder,
            required: field.required || false,
            position: field.position,
            help_text: field.description,
            default_value: field.defaultValue,
            validation_rules: field.validation || {},
            options: field.options && Array.isArray(field.options) 
              ? { values: field.options.map((opt: any) => opt.value || opt.label) } 
              : field.options || undefined
          }))
        } : {})
      }));

      // Transform actions to match backend format
      const actionsAttributes = (state.workflow.actions || []).map(action => ({
        id: typeof action.id === 'string' && action.id.startsWith('action_') ? undefined : action.id,
        type: action.type, // Use full class name
        name: action.name,
        description: action.description,
        position: action.position,
        enabled: action.enabled !== undefined ? action.enabled : true,
        config: action.config || {}
      }));

      const { data } = await api.put(`/workflows/${state.workflow.id}`, {
        workflow: {
          name: state.workflow.name,
          description: state.workflow.description,
          triggers_attributes: triggersAttributes,
          actions_attributes: actionsAttributes,
        },
      });
      dispatch({ type: 'SET_WORKFLOW', payload: data });
      antdMessage.success('Workflow saved successfully!');
    } catch (err) {
      console.error('Failed to save workflow:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save workflow' });
      antdMessage.error('Error saving workflow.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTrigger = (triggerId: string, updates: Partial<WorkflowTrigger>) => {
    dispatch({ type: 'UPDATE_TRIGGER', payload: { triggerId, updates } });
  };

  const updateAction = (actionId: string, updates: Partial<WorkflowAction>) => {
    dispatch({ type: 'UPDATE_ACTION', payload: { actionId, updates } });
  };

  const addTrigger = (trigger: Omit<WorkflowTrigger, 'id' | 'position'>) => {
    const newTrigger: WorkflowTrigger = {
      ...trigger,
      id: `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: state.workflow ? (state.workflow.triggers || []).length : 0,
    };
    dispatch({ type: 'ADD_TRIGGER', payload: newTrigger });
  };

  const addAction = (action: Omit<WorkflowAction, 'id' | 'position'>) => {
    const newAction: WorkflowAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: state.workflow ? (state.workflow.actions || []).length : 0,
    };
    dispatch({ type: 'ADD_ACTION', payload: newAction });
  };

  const deleteTrigger = (triggerId: string) => {
    dispatch({ type: 'DELETE_TRIGGER', payload: triggerId });
  };

  const deleteAction = (actionId: string) => {
    dispatch({ type: 'DELETE_ACTION', payload: actionId });
  };

  const updateWorkflowMeta = (updates: Partial<Pick<Workflow, 'name' | 'description' | 'status'>>) => {
    dispatch({ type: 'UPDATE_WORKFLOW_META', payload: updates });
  };

  const setSelectedStep = (step: (WorkflowTrigger | WorkflowAction) | null) => {
    dispatch({ type: 'SET_SELECTED_STEP', payload: step });
  };

  return (
    <WorkflowContext.Provider
      value={{
        state,
        fetchWorkflow,
        fetchTriggerAndActionTypes,
        saveWorkflow,
        updateTrigger,
        updateAction,
        addTrigger,
        addAction,
        deleteTrigger,
        deleteAction,
        updateWorkflowMeta,
        setSelectedStep,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

// Hook to use workflow context
export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}