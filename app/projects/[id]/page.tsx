'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, message, Spin } from 'antd';
import { api } from '@/lib/api';

const { Title, Paragraph } = Typography;

interface Project {
  id: number;
  name: string;
  description: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        setProject(data);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err && 
            err.response && typeof err.response === 'object' && 
            'status' in err.response && err.response.status === 404) {
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
  }, [id, router]);

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
      
      <div style={{ marginTop: 40 }}>
        <Paragraph>Conversation functionality has been moved to the workflow system.</Paragraph>
      </div>
    </div>
  );
}
