'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { message } from 'antd';

export interface AvailableModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
  temperature?: number;
  system_message?: string;
  underlying_model?: string;
  account_id?: number;
}

export interface Agent {
  id: number;
  name: string;
  description?: string;
  system_message: string;
  underlying_model: string;
  temperature: number;
  account_id: number | null;
  account_name?: string;
  parent_agent_id?: number | null;
  parent_agent_name?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
  can_be_deleted?: boolean;
  child_agents_count?: number;
}

export interface UserConfiguration {
  user: any;
  available_llm_models: AvailableModel[];
  available_agents: Agent[];
  available_models_combined: AvailableModel[];
  workflow_action_types: any[];
  workflow_trigger_types: any[];
  permissions: {
    can_manage_accounts: boolean;
    can_manage_users: boolean;
    can_create_global_agents: boolean;
    can_manage_workflows: boolean;
    can_view_all_agents: boolean;
  };
  account: {
    id: number;
    name: string;
    user_count: number;
    workflow_count: number;
    agent_count: number;
  };
}

interface ConfigurationContextType {
  configuration: UserConfiguration | null;
  loading: boolean;
  fetchConfiguration: () => Promise<void>;
  refreshAgents: () => Promise<void>;
}

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

interface ConfigurationProviderProps {
  children: ReactNode;
}

export function ConfigurationProvider({ children }: ConfigurationProviderProps) {
  const [configuration, setConfiguration] = useState<UserConfiguration | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfiguration = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/user_configuration');
      setConfiguration(data);
    } catch (error) {
      console.error('Failed to fetch configuration:', error);
      message.error('Failed to load configuration');
      setConfiguration(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshAgents = async () => {
    try {
      const { data } = await api.get('/agents');
      if (configuration) {
        setConfiguration({
          ...configuration,
          available_agents: data,
        });
      }
    } catch (error) {
      console.error('Failed to refresh agents:', error);
      message.error('Failed to refresh agents');
    }
  };

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const contextValue = {
    configuration,
    loading,
    fetchConfiguration,
    refreshAgents,
  };

  return (
    <ConfigurationContext.Provider value={contextValue}>
      {children}
    </ConfigurationContext.Provider>
  );
}

export function useConfiguration() {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
}