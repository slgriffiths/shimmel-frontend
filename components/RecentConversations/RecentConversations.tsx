"use client";

import { useEffect, useState } from "react";
import { List, Card, Typography } from "antd";
import styles from "./RecentConversations.module.scss";
import Link from "next/link";

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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations`)
      .then((res) => res.json())
      .then((data) => setConversations(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className={styles.recentConversations}>
      <Title level={4}>Recent Conversations</Title>
      <List
        itemLayout="horizontal"
        dataSource={conversations.slice(0, 5)}
        renderItem={(conv) => (
          <List.Item>
            <Link href={`/chat/${conv.uuid}`}>
              <Card hoverable className={styles.conversationCard}>
                <Paragraph strong>{conv.title}</Paragraph>
                <Paragraph type="secondary">{conv.last_message}</Paragraph>
              </Card>
            </Link>
          </List.Item>
        )}
      />
    </div>
  );
}