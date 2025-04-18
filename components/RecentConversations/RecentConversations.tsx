'use client';

import { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, message as antdMessage } from 'antd';
import styles from './RecentConversations.module.scss';
import Link from 'next/link';
import { api } from '@/lib/api';

const { Title, Paragraph } = Typography;

interface Conversation {
  id: string;
  uuid: string;
  title: string;
  last_message?: string;
}

export default function RecentConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get('/conversations');
        setConversations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load conversations:', err);
        antdMessage.error('Error loading conversations.');
      }
    };
    fetchConversations();
  }, []);

  return (
    <div className={styles.recentConversations}>
      <Title level={4}>Recent Conversations</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        {conversations.slice(0, 5).map((conv) => (
          <Col md={10} key={conv.id}>
            <Link key={conv.uuid} href={`/chat/${conv.uuid}`}>
              <Card hoverable>
                <Paragraph strong>{conv.title}</Paragraph>
                <Paragraph type='secondary'>{conv.last_message}</Paragraph>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
