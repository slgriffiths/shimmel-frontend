import { Typography } from 'antd';
import GenerateTextActionConfig from './GenerateTextActionConfig';
import SendEmailActionConfig from './SendEmailActionConfig';

const { Paragraph } = Typography;

interface ActionConfigProps {
  actionType: string;
  config: Record<string, any>;
  onConfigChange: (config: Record<string, any>) => void;
}

export default function ActionConfig({ actionType, config, onConfigChange }: ActionConfigProps) {
  switch (actionType) {
    case 'Workflow::Action::GenerateText':
      return (
        <GenerateTextActionConfig
          config={config}
          onConfigChange={onConfigChange}
        />
      );
    
    case 'Workflow::Action::SendEmail':
      return (
        <SendEmailActionConfig
          config={config}
          onConfigChange={onConfigChange}
        />
      );
    
    case 'Workflow::Action::CreateRecord':
      return (
        <div>
          <Paragraph>Create Record action configuration will be implemented here.</Paragraph>
          <Paragraph>Action Type: {actionType}</Paragraph>
        </div>
      );
    
    default:
      return (
        <div>
          <Paragraph>Configuration form for: {actionType}</Paragraph>
          <Paragraph>This action type doesn't have a custom configuration form yet.</Paragraph>
          <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      );
  }
}