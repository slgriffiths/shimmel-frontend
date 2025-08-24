'use client';

import { useEffect, useState } from 'react';
import { Typography, Spin, Button, Card, Dropdown, Drawer } from 'antd';
import { SaveOutlined, MoreOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import styles from './WorkflowDetail.module.scss';
import { useWorkflow, TriggerType, ActionType } from '@/contexts/WorkflowContext';
import TriggerActionSelectionModal from './TriggerActionSelectionModal';
import FormTriggerConfig from './FormTriggerConfig';
import ActionConfig from './ActionConfig';
import { FormField } from './formFieldTypes';

const { Title, Paragraph } = Typography;

interface WorkflowDetailProps {
  workflowId: string;
}

export default function WorkflowDetail({ workflowId }: WorkflowDetailProps) {
  const { state, fetchWorkflow, fetchTriggerAndActionTypes, saveWorkflow, setSelectedStep, addTrigger, addAction, updateTrigger, updateAction } =
    useWorkflow();
  const { workflow, loading, error, selectedStep, triggerTypes, actionTypes } = state;
  const [selectionModal, setSelectionModal] = useState<{ open: boolean; mode: 'trigger' | 'action' }>({
    open: false,
    mode: 'trigger',
  });

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
      action_type: selectedType.type,
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
      console.log('Updating form fields:', fields);
      const updatedConfig = {
        ...selectedStep.config,
        form_fields: fields,
      };
      console.log('Updated config:', updatedConfig);
      
      // Check if this is a trigger or action by looking at action_type
      if (selectedStep.action_type?.includes('Trigger')) {
        updateTrigger(selectedStep.id, { config: updatedConfig });
      } else {
        updateAction(selectedStep.id, { config: updatedConfig });
      }
    }
  };

  const handleActionConfigChange = (config: Record<string, any>) => {
    if (selectedStep) {
      console.log('Updating action config:', config);
      
      // Check if this is a trigger or action by looking at action_type
      if (selectedStep.action_type?.includes('Trigger')) {
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
    ...(workflow.triggers || []).map(trigger => ({ ...trigger, type: 'trigger' })),
    ...(workflow.actions || []).map(action => ({ ...action, type: 'action' }))
  ].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'trigger' ? -1 : 1;
    }
    return a.position - b.position;
  });

  return (
    <div className={styles.workflowDetail}>
      <div className={styles.header}>
        <div>
          <Title level={2}>{workflow.name}</Title>
          <Paragraph type='secondary'>Created on {new Date(workflow.created_at).toLocaleDateString()}</Paragraph>
        </div>
        <Button type='primary' icon={<SaveOutlined />} onClick={saveWorkflow} loading={loading}>
          Save Workflow
        </Button>
      </div>

      <div className={styles.workflowBuilder}>
        {allSteps.map((step, index) => (
          <div key={step.id} className={styles.actionContainer}>
            <Card
              className={`${styles.actionCard} ${styles[step.type]}`}
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
                <span className={styles.actionType}>{step.type === 'trigger' ? 'Trigger' : 'Action'}</span>
                <Title level={4} className={styles.actionTitle}>
                  {step.name || step.action_type}
                </Title>
              </div>
              <Paragraph type='secondary' className={styles.actionDescription}>
                {step.action_type}
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
            // Check if selectedStep is a trigger or action to find in the right array
            const isTrigger = selectedStep.action_type?.includes('Trigger');
            const currentStep = isTrigger
              ? workflow?.triggers.find((trigger) => trigger.id === selectedStep.id)
              : workflow?.actions.find((action) => action.id === selectedStep.id);
            
            // Ensure the step has the correct type property for the UI logic
            const stepToUse = currentStep 
              ? { ...currentStep, type: isTrigger ? 'trigger' : 'action' }
              : selectedStep;

            return (
              <div>
                {stepToUse.action_type === 'Workflow::Trigger::Form' ? (
                  <FormTriggerConfig
                    fields={stepToUse.config?.form_fields || []}
                    onFieldsChange={handleFormFieldsChange}
                  />
                ) : stepToUse.type === 'action' ? (
                  <ActionConfig
                    actionType={stepToUse.action_type}
                    config={stepToUse.config || {}}
                    onConfigChange={handleActionConfigChange}
                  />
                ) : (
                  <div>
                    <Paragraph>Configuration form for: {stepToUse.name || stepToUse.action_type}</Paragraph>
                    <Paragraph>Type: {stepToUse.type}</Paragraph>
                    <Paragraph>Action Type: {stepToUse.action_type}</Paragraph>
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
  );
}
