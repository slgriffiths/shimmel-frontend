'use client'; // 🔥 This forces the component to be client-rendered

import { Card, Typography, Row, Col, Spin, message as antdMessage } from 'antd';
import styles from './ResearchAssistants.module.scss';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

interface Assistant {
  id: string;
  name: string;
  description: string;
  openai_assistant_id: string;
}

export default function ResearchAssistants() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const isFetchingAssistants = !assistants;

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const { data } = await api.get('/assistants');
        setAssistants(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load assistants:', err);
        antdMessage.error('Error loading assistants.');
      }
    };
    fetchAssistants();
  }, []);

  if (isFetchingAssistants) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <Spin size='small' />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Title level={3}>Research Assistants</Title>
      <Row gutter={[16, 16]}>
        {assistants.map((assistant) => (
          <Col key={assistant.id} xs={24} sm={12} md={8}>
            <Link key={assistant.id} href={`/chat/new/${assistant.id}`}>
              <Card className={styles.researchCard} hoverable>
                <Title level={4} className={styles.cardTitle}>
                  {assistant.name}
                </Title>
                <Paragraph className={styles.cardDescription}>{assistant.description}</Paragraph>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
