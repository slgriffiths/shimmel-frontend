'use client';

import { useEffect, useState } from 'react';
import { Typography, Spin, Button, Card, Dropdown, Drawer, Tabs, Tag } from 'antd';
import {
  SaveOutlined,
  MoreOutlined,
  EditOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import styles from './WorkflowDetail.module.scss';
import { useWorkflow, TriggerType, ActionType } from '@/contexts/WorkflowContext';
import { useConfiguration } from '@/contexts/ConfigurationContext';
import TriggerActionSelectionModal from './TriggerActionSelectionModal';
import FormTriggerConfig from './FormTriggerConfig';
import ActionConfig from './ActionConfig';
import WorkflowRun from './WorkflowRun';
import { FormField } from './formFieldTypes';
import RunHistoryDrawer from '../RunHistory/RunHistoryDrawer';

const { Title, Paragraph } = Typography;

interface WorkflowDetailProps {
  workflowId: string;
}

export default function WorkflowDetail({ workflowId }: WorkflowDetailProps) {
  const {
    state,
    fetchWorkflow,
    fetchTriggerAndActionTypes,
    saveWorkflow,
    setSelectedStep,
    addTrigger,
    addAction,
    updateTrigger,
    updateAction,
  } = useWorkflow();
  const { workflow, loading, error, selectedStep, triggerTypes, actionTypes } = state;
  const { configuration } = useConfiguration();
  const [selectionModal, setSelectionModal] = useState<{ open: boolean; mode: 'trigger' | 'action' }>({
    open: false,
    mode: 'trigger',
  });
  const [runHistoryOpen, setRunHistoryOpen] = useState(false);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow(workflowId);
      fetchTriggerAndActionTypes();
    }
  }, [workflowId, fetchWorkflow, fetchTriggerAndActionTypes]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size='large' />
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className={styles.errorContainer}>
        <Title level={3}>Workflow not found</Title>
        <Paragraph>The workflow you're looking for doesn't exist or has been deleted.</Paragraph>
      </div>
    );
  }

  const handleEditAction = (action: any) => {
    setSelectedStep(action);
  };

  const handleCardClick = (action: any) => {
    setSelectedStep(action);
  };

  const handleAddTrigger = () => {
    setSelectionModal({ open: true, mode: 'trigger' });
  };

  const handleAddAction = () => {
    setSelectionModal({ open: true, mode: 'action' });
  };

  const handleTypeSelection = (selectedType: TriggerType | ActionType) => {
    const newItem = {
      type: selectedType.type, // Use backend field name directly
      name: selectedType.name,
      config: {},
    };

    if (selectionModal.mode === 'trigger') {
      addTrigger(newItem);
    } else {
      addAction(newItem);
    }

    setSelectionModal({ open: false, mode: 'trigger' });
  };

  const handleCancelSelection = () => {
    setSelectionModal({ open: false, mode: 'trigger' });
  };

  const handleFormFieldsChange = (fields: FormField[]) => {
    if (selectedStep) {
      // For Form triggers, update form_fields directly (not in config)
      if (selectedStep.type?.includes('Trigger')) {
        updateTrigger(selectedStep.id, { form_fields: fields });
      } else {
        updateAction(selectedStep.id, { config: { ...selectedStep.config, form_fields: fields } });
      }
    }
  };

  const handleActionConfigChange = (config: Record<string, any>) => {
    if (selectedStep) {
      // Check if this is a trigger or action by looking at type
      if (selectedStep.type?.includes('Trigger')) {
        updateTrigger(selectedStep.id, { config });
      } else {
        updateAction(selectedStep.id, { config });
      }
    }
  };

  const getActionMenuItems = (action: any): MenuProps['items'] => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => handleEditAction(action),
    },
    {
      key: 'change-type',
      label: `Change ${action.type === 'trigger' ? 'Trigger' : 'Action'} Type`,
      onClick: () => {
        // TODO: Implement change type functionality
        console.log('Change type for:', action.id);
      },
    },
  ];

  // Combine triggers and actions for display, with triggers first
  const allSteps = [
    ...(workflow.triggers || []).map((trigger) => ({ ...trigger, stepType: 'trigger' })),
    ...(workflow.actions || []).map((action) => ({ ...action, stepType: 'action' })),
  ].sort((a, b) => {
    if (a.stepType !== b.stepType) {
      return a.stepType === 'trigger' ? -1 : 1;
    }
    return a.position - b.position;
  });

  // Check if user is super admin
  const isSuperAdmin = configuration?.user?.data?.role === 'super';

  const workflowTabItems = [
    {
      key: 'workflow',
      label: 'Workflow',
      children: (
        <div>
          <div className={styles.header}>
            <div>
              <Title level={2}>{workflow.name}</Title>
              {workflow.description && (
                <Paragraph type='secondary' style={{ fontSize: '14px', marginBottom: '4px' }}>
                  {workflow.description}
                </Paragraph>
              )}
              <Paragraph type='secondary' style={{ fontSize: '12px', margin: 0 }}>
                Created on {new Date(workflow.created_at).toLocaleDateString()}
              </Paragraph>
              {isSuperAdmin && (
                <div style={{ marginTop: '8px' }}>
                  <Tag color={workflow.account_id ? 'blue' : 'green'}>
                    {workflow.account_name || workflow.account?.name || 'Global'}
                  </Tag>
                </div>
              )}
            </div>
            <Button type='primary' icon={<SaveOutlined />} onClick={saveWorkflow} loading={loading}>
              Save Workflow
            </Button>
          </div>

          <div className={styles.workflowBuilder}>
            {allSteps.map((step, index) => (
              <div key={`${step.stepType}-${step.id}`} className={styles.actionContainer}>
                <Card
                  className={`${styles.actionCard} ${styles[step.stepType]}`}
                  onClick={() => handleCardClick(step)}
                  hoverable
                  actions={[
                    <Dropdown
                      key='more'
                      menu={{ items: getActionMenuItems(step) }}
                      trigger={['click']}
                      placement='bottomRight'
                    >
                      <Button type='text' icon={<MoreOutlined />} />
                    </Dropdown>,
                  ]}
                >
                  <div className={styles.actionHeader}>
                    <span className={styles.actionType}>{step.stepType === 'trigger' ? 'Trigger' : 'Action'}</span>
                    <Title level={4} className={styles.actionTitle}>
                      {step.name || step.type}
                    </Title>
                  </div>
                  <Paragraph type='secondary' className={styles.actionDescription}>
                    {step.type}
                  </Paragraph>
                </Card>

                {index < allSteps.length - 1 && (
                  <div className={styles.connector}>
                    <div className={styles.connectorLine}></div>
                  </div>
                )}

                {index === allSteps.length - 1 && (
                  <div className={styles.addActionContainer}>
                    <div className={styles.connectorLine}></div>
                    <Button type='dashed' icon={<PlusOutlined />} onClick={handleAddAction} />
                  </div>
                )}
              </div>
            ))}

            {allSteps.length === 0 && (
              <div className={styles.emptyState}>
                <Title level={4}>No triggers or actions yet</Title>
                <Paragraph>Start building your workflow by adding a trigger.</Paragraph>
                <Button type='primary' icon={<PlusOutlined />} onClick={handleAddTrigger}>
                  Add Trigger
                </Button>
              </div>
            )}
          </div>

          <Drawer title='Edit Configuration' open={!!selectedStep} onClose={() => setSelectedStep(null)} width={600}>
            {selectedStep &&
              (() => {
                // Get the current step from workflow state to ensure we have the latest data
                // Check if selectedStep is a trigger or action by checking both arrays
                const triggerStep = workflow?.triggers.find((trigger) => trigger.id === selectedStep.id);
                const actionStep = workflow?.actions.find((action) => action.id === selectedStep.id);
                const isTrigger = !!triggerStep;
                const currentStep = triggerStep || actionStep;

                // Use the fresh data from workflow state, with stepType determined from array membership
                const stepToUse = currentStep
                  ? { ...currentStep, stepType: isTrigger ? 'trigger' : 'action' }
                  : { ...selectedStep, stepType: isTrigger ? 'trigger' : 'action' };

                return (
                  <div>
                    {stepToUse.type === 'Workflow::Trigger::Form' ? (
                      <FormTriggerConfig
                        fields={(stepToUse.form_fields || []).map((field: any) => ({
                          ...field,
                          type: field.field_type, // Map backend field_type to frontend type
                          description: field.help_text,
                          defaultValue: field.default_value,
                          validation: field.validation_rules,
                        }))}
                        onFieldsChange={handleFormFieldsChange}
                      />
                    ) : stepToUse.stepType === 'action' ? (
                      <ActionConfig
                        actionType={stepToUse.type}
                        config={stepToUse.config || {}}
                        onConfigChange={handleActionConfigChange}
                      />
                    ) : (
                      <div>
                        <Paragraph>Configuration form for: {stepToUse.name || stepToUse.type}</Paragraph>
                        <Paragraph>Type: {stepToUse.type}</Paragraph>
                        <Paragraph>Step Type: {stepToUse.stepType}</Paragraph>
                        <Paragraph type='secondary'>
                          This trigger type doesn't have a custom configuration form yet.
                        </Paragraph>
                      </div>
                    )}
                  </div>
                );
              })()}
          </Drawer>

          <TriggerActionSelectionModal
            open={selectionModal.open}
            mode={selectionModal.mode}
            triggerTypes={triggerTypes}
            actionTypes={actionTypes}
            onSelect={handleTypeSelection}
            onCancel={handleCancelSelection}
          />
        </div>
      ),
    },
    {
      key: 'run',
      label: (
        <span>
          <PlayCircleOutlined />
          Run
        </span>
      ),
      children: <WorkflowRun workflowId={workflowId} />,
    },
  ];

  return (
    <div className={styles.workflowDetail}>
      <Tabs
        items={workflowTabItems}
        tabBarExtraContent={
          <Button
            type='default'
            icon={<HistoryOutlined />}
            onClick={() => setRunHistoryOpen(true)}
            style={{ marginRight: 16 }}
          >
            View Previous Runs
          </Button>
        }
      />

      <RunHistoryDrawer open={runHistoryOpen} onClose={() => setRunHistoryOpen(false)} workflowId={workflowId} />

      <Drawer title='Edit Configuration' open={!!selectedStep} onClose={() => setSelectedStep(null)} width={600}>
        {selectedStep &&
          (() => {
            // Get the current step from workflow state to ensure we have the latest data
            // Check if selectedStep is a trigger or action by checking both arrays
            const triggerStep = workflow?.triggers.find((trigger) => trigger.id === selectedStep.id);
            const actionStep = workflow?.actions.find((action) => action.id === selectedStep.id);
            const isTrigger = !!triggerStep;
            const currentStep = triggerStep || actionStep;

            // Use the fresh data from workflow state, with stepType determined from array membership
            const stepToUse = currentStep
              ? { ...currentStep, stepType: isTrigger ? 'trigger' : 'action' }
              : { ...selectedStep, stepType: isTrigger ? 'trigger' : 'action' };

            return (
              <div>
                {stepToUse.type === 'Workflow::Trigger::Form' ? (
                  <FormTriggerConfig
                    fields={(stepToUse.form_fields || []).map((field: any) => ({
                      ...field,
                      type: field.field_type, // Map backend field_type to frontend type
                      description: field.help_text,
                      defaultValue: field.default_value,
                      validation: field.validation_rules,
                    }))}
                    onFieldsChange={handleFormFieldsChange}
                  />
                ) : stepToUse.stepType === 'action' ? (
                  <ActionConfig
                    actionType={stepToUse.type}
                    config={stepToUse.config || {}}
                    onConfigChange={handleActionConfigChange}
                  />
                ) : (
                  <div>
                    <Paragraph>Configuration form for: {stepToUse.name || stepToUse.type}</Paragraph>
                    <Paragraph>Type: {stepToUse.type}</Paragraph>
                    <Paragraph>Step Type: {stepToUse.stepType}</Paragraph>
                    <Paragraph type='secondary'>
                      This trigger type doesn't have a custom configuration form yet.
                    </Paragraph>
                  </div>
                )}
              </div>
            );
          })()}
      </Drawer>
    </div>
  );
}
