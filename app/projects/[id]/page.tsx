'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Typography, message, Row, Col, Spin } from 'antd';
import { api } from '@/lib/api';

const { Title, Paragraph } = Typography;

interface Conversation {
  id: number;
  uuid: string;
  title: string;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        setProject(data);

        const convoRes = await api.get(`/projects/${id}/conversations`);
        setConversations(convoRes.data || []);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          message.error('Project not found. Redirecting to dashboard...');
          router.push('/dashboard');
        } else {
          message.error('An error occurred while fetching the project.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <Spin size='large' />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>{project.name}</Title>
      <Paragraph type='secondary'>{project.description}</Paragraph>

      <Title level={4} style={{ marginTop: 40 }}>
        Recent Conversations
      </Title>

      <Row gutter={[16, 16]}>
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <Col xs={24} sm={12} md={8} key={conv.id}>
              <Card title={conv.title} hoverable onClick={() => router.push(`/chat/${conv.uuid}`)}>
                <Paragraph type='secondary'>Created: {new Date(conv.created_at).toLocaleString()}</Paragraph>
              </Card>
            </Col>
          ))
        ) : (
          <Paragraph type='secondary'>No conversations found for this project.</Paragraph>
        )}
      </Row>
    </div>
  );
}
