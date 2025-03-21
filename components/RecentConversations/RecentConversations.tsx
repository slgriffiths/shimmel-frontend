"use client";

import { useEffect, useState } from "react";
import { List, Card, Typography } from "antd";
import styles from "./RecentConversations.module.scss";

const { Title, Paragraph } = Typography;

interface Conversation {
  id: string;
  title: string;
  last_message?: string;
}

export default function RecentConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/conversations`)
      .then((res) => res.json())
      .then((data) => setConversations(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className={styles.recentConversations}>
      <Title level={4}>Recent Conversations</Title>
      <List
        itemLayout="horizontal"
        dataSource={conversations}
        renderItem={(conv) => (
          <List.Item>
            <Card hoverable className={styles.conversationCard}>
              <Paragraph strong>{conv.title}</Paragraph>
              <Paragraph type="secondary">{conv.last_message}</Paragraph>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}