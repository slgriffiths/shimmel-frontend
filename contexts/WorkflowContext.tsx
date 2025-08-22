'use client';

import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { api } from '@/lib/api';
import { message as antdMessage } from 'antd';

// Types - backend will provide trigger/action definitions
export interface WorkflowAction {
  id: string;
  type: 'trigger' | 'action';
  action_type: string;
  name?: string;
  config: Record<string, any>;
  order: number;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: string;
  actions: WorkflowAction[];
  created_at: string;
  updated_at: string;
}

// Reducer action types
type WorkflowContextAction =
  | { type: 'SET_WORKFLOW'; payload: Workflow }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_ACTION'; payload: { actionId: string; updates: Partial<WorkflowAction> } }
  | { type: 'ADD_ACTION'; payload: WorkflowAction }
  | { type: 'DELETE_ACTION'; payload: string }
  | { type: 'UPDATE_WORKFLOW_META'; payload: Partial<Pick<Workflow, 'name' | 'description' | 'status'>> }
  | { type: 'SET_SELECTED_STEP'; payload: WorkflowAction | null };

// State type
interface WorkflowState {
  workflow: Workflow | null;
  loading: boolean;
  error: string | null;
  selectedStep: WorkflowAction | null;
}

// Initial state
const initialState: WorkflowState = {
  workflow: null,
  loading: false,
  error: null,
  selectedStep: null,
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
    case 'ADD_ACTION':
      if (!state.workflow) return state;
      return {
        ...state,
        workflow: {
          ...state.workflow,
          actions: [...state.workflow.actions, action.payload].sort((a, b) => a.order - b.order),
        },
      };
    case 'DELETE_ACTION':
      if (!state.workflow) return state;
      return {
        ...state,
        workflow: {
          ...state.workflow,
          actions: state.workflow.actions.filter(workflowAction => workflowAction.id !== action.payload),
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
    default:
      return state;
  }
}

// Context type
interface WorkflowContextType {
  state: WorkflowState;
  fetchWorkflow: (id: string) => Promise<void>;
  saveWorkflow: () => Promise<void>;
  updateAction: (actionId: string, updates: Partial<WorkflowAction>) => void;
  addAction: (action: Omit<WorkflowAction, 'id' | 'order'>) => void;
  deleteAction: (actionId: string) => void;
  updateWorkflowMeta: (updates: Partial<Pick<Workflow, 'name' | 'description' | 'status'>>) => void;
  setSelectedStep: (step: WorkflowAction | null) => void;
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

  const saveWorkflow = async () => {
    if (!state.workflow) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.put(`/workflows/${state.workflow.id}`, {
        workflow: {
          name: state.workflow.name,
          description: state.workflow.description,
          status: state.workflow.status,
          actions: state.workflow.actions,
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

  const updateAction = (actionId: string, updates: Partial<WorkflowAction>) => {
    dispatch({ type: 'UPDATE_ACTION', payload: { actionId, updates } });
  };

  const addAction = (action: Omit<WorkflowAction, 'id' | 'order'>) => {
    const newAction: WorkflowAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: state.workflow ? state.workflow.actions.length : 0,
    };
    dispatch({ type: 'ADD_ACTION', payload: newAction });
  };

  const deleteAction = (actionId: string) => {
    dispatch({ type: 'DELETE_ACTION', payload: actionId });
  };

  const updateWorkflowMeta = (updates: Partial<Pick<Workflow, 'name' | 'description' | 'status'>>) => {
    dispatch({ type: 'UPDATE_WORKFLOW_META', payload: updates });
  };

  const setSelectedStep = (step: WorkflowAction | null) => {
    dispatch({ type: 'SET_SELECTED_STEP', payload: step });
  };

  return (
    <WorkflowContext.Provider
      value={{
        state,
        fetchWorkflow,
        saveWorkflow,
        updateAction,
        addAction,
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