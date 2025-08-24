import { Modal, List, Typography, Card, Row, Col, Button } from 'antd';
import { ThunderboltOutlined, SettingOutlined } from '@ant-design/icons';
import styles from './TriggerActionSelectionModal.module.scss';
import { TriggerType, ActionType } from '@/contexts/WorkflowContext';

const { Title, Paragraph } = Typography;

interface TriggerActionSelectionModalProps {
  open: boolean;
  mode: 'trigger' | 'action';
  triggerTypes: TriggerType[];
  actionTypes: ActionType[];
  onSelect: (type: TriggerType | ActionType) => void;
  onCancel: () => void;
}

export default function TriggerActionSelectionModal({
  open,
  mode,
  triggerTypes,
  actionTypes,
  onSelect,
  onCancel,
}: TriggerActionSelectionModalProps) {
  const items = mode === 'trigger' ? triggerTypes : actionTypes;
  const title = mode === 'trigger' ? 'Select a Trigger' : 'Select an Action';

  return (
    <Modal title={title} open={open} onCancel={onCancel} footer={null} width={800} className={styles.selectionModal}>
      <div className={styles.description}>
        <Paragraph type='secondary'>
          {mode === 'trigger'
            ? 'Choose a trigger to start your workflow when specific events occur.'
            : 'Choose an action to perform when this step is reached in your workflow.'}
        </Paragraph>
      </div>

      <div className={styles.itemsContainer}>
        <Row gutter={[16, 16]}>
          {(items || []).map((item) => (
            <Col xs={24} sm={12} key={item.type}>
              <Card hoverable className={styles.itemCard} onClick={() => onSelect(item)}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemIcon}>
                    {mode === 'trigger' ? <ThunderboltOutlined /> : <SettingOutlined />}
                  </div>
                  <div className={styles.itemInfo}>
                    <Title level={5} className={styles.itemTitle}>
                      {item.name}
                    </Title>
                    {item.category && <span className={styles.category}>{item.category}</span>}
                  </div>
                </div>
                <Paragraph className={styles.itemDescription}>{item.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>

        {(!items || items.length === 0) && (
          <div className={styles.emptyState}>
            <Title level={4}>No {mode}s available</Title>
            <Paragraph type='secondary'>There are currently no {mode}s configured for this workflow system.</Paragraph>
          </div>
        )}
      </div>
    </Modal>
  );
}
