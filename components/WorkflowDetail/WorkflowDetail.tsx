'use client';

import { useEffect, useState } from 'react';
import { Typography, Spin, Button, Card, Dropdown, Drawer } from 'antd';
import { SaveOutlined, MoreOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import styles from './WorkflowDetail.module.scss';
import { useWorkflow, TriggerType, ActionType } from '@/contexts/WorkflowContext';
import TriggerActionSelectionModal from './TriggerActionSelectionModal';
import FormTriggerConfig from './FormTriggerConfig';
import { FormField } from './formFieldTypes';

const { Title, Paragraph } = Typography;

interface WorkflowDetailProps {
  workflowId: string;
}

export default function WorkflowDetail({ workflowId }: WorkflowDetailProps) {
  const { state, fetchWorkflow, fetchTriggerAndActionTypes, saveWorkflow, setSelectedStep, addAction, updateAction } = useWorkflow();
  const { workflow, loading, error, selectedStep, triggerTypes, actionTypes } = state;
  const [selectionModal, setSelectionModal] = useState<{ open: boolean; mode: 'trigger' | 'action' }>({
    open: false,
    mode: 'trigger'
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
        <Spin size="large" />
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
    const newAction = {
      type: selectionModal.mode,
      action_type: selectedType.type,
      name: selectedType.name,
      config: {},
    };
    
    addAction(newAction);
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
        form_fields: fields
      };
      console.log('Updated config:', updatedConfig);
      updateAction(selectedStep.id, { config: updatedConfig });
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

  // Sort actions by position, with triggers first
  const sortedActions = [...(workflow.actions || [])].sort((a, b) => {
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
          <Paragraph type="secondary">
            Created on {new Date(workflow.created_at).toLocaleDateString()}
          </Paragraph>
        </div>
        <Button 
          type="primary" 
          icon={<SaveOutlined />}
          onClick={saveWorkflow}
          loading={loading}
        >
          Save Workflow
        </Button>
      </div>

      <div className={styles.workflowBuilder}>
        {sortedActions.map((action, index) => (
          <div key={action.id} className={styles.actionContainer}>
            <Card 
              className={`${styles.actionCard} ${styles[action.type]}`}
              onClick={() => handleCardClick(action)}
              hoverable
              actions={[
                <Dropdown 
                  key="more"
                  menu={{ items: getActionMenuItems(action) }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              ]}
            >
              <div className={styles.actionHeader}>
                <span className={styles.actionType}>
                  {action.type === 'trigger' ? 'Trigger' : 'Action'}
                </span>
                <Title level={4} className={styles.actionTitle}>
                  {action.name || action.action_type}
                </Title>
              </div>
              <Paragraph type="secondary" className={styles.actionDescription}>
                {action.action_type}
              </Paragraph>
            </Card>

            {index < sortedActions.length - 1 && (
              <div className={styles.connector}>
                <div className={styles.connectorLine}></div>
              </div>
            )}
            
            {index === sortedActions.length - 1 && (
              <div className={styles.addActionContainer}>
                <div className={styles.connectorLine}></div>
                <Button 
                  type="dashed" 
                  shape="circle" 
                  icon={<PlusOutlined />}
                  onClick={handleAddAction}
                />
              </div>
            )}
          </div>
        ))}

        {sortedActions.length === 0 && (
          <div className={styles.emptyState}>
            <Title level={4}>No triggers or actions yet</Title>
            <Paragraph>Start building your workflow by adding a trigger.</Paragraph>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddTrigger}
            >
              Add Trigger
            </Button>
          </div>
        )}
      </div>

      <Drawer
        title="Edit Configuration"
        open={!!selectedStep}
        onClose={() => setSelectedStep(null)}
        width={500}
      >
        {selectedStep && (() => {
          // Get the current step from workflow state to ensure we have the latest data
          const currentStep = workflow?.actions.find(action => action.id === selectedStep.id);
          const stepToUse = currentStep || selectedStep;
          
          return (
            <div>
              {stepToUse.action_type === 'Workflow::Trigger::Form' ? (
                <FormTriggerConfig
                  fields={stepToUse.config?.form_fields || []}
                  onFieldsChange={handleFormFieldsChange}
                />
              ) : (
                <div>
                  <Paragraph>Configuration form for: {stepToUse.name || stepToUse.action_type}</Paragraph>
                  <Paragraph>Type: {stepToUse.type}</Paragraph>
                  <Paragraph>Action Type: {stepToUse.action_type}</Paragraph>
                  {/* TODO: Implement dynamic form based on action type */}
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