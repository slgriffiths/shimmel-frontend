"use client";

import { useState, useEffect } from "react";
import { Input, Button, List, Typography, Card, Spin } from "antd";
import { SearchOutlined, SendOutlined } from "@ant-design/icons";
import styles from "./SearchChat.module.scss";

const { Title, Paragraph } = Typography;

interface Conversation {
  id: string;
  title: string;
  last_message?: string;
}

export default function SearchChat() {
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>();
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {        
    // Fetch recent conversations (Replace with actual API call)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations`)
      .then((res) => res.json())
      .then((data) => setConversations(Array.isArray(data) ? data : []))
      .catch(() => setConversations([]));
  }, []);  

  const handleSearch = async () => {
    if (!query.trim()) return;

    setResponse("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: query }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        chunk
          .split("\n\n")
          .filter(Boolean)
          .forEach((line) => {
            const data = line.replace(/^data:\s*/, "").trim();

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "content") {
                setResponse((prev) => (prev || "") + parsed.content);                
              } else if (parsed.type === "done") {
                setLoading(false);
              } else if (parsed.type === "error") {
                setError(parsed.message || "Unexpected error");
              }
            } catch {
              console.warn("Non-JSON chunk:", data);
            }
          });
      }
    } catch (err: any) {
      console.error("Streaming failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Title level={3} className={styles.heading}>
        Hey, how can we help you today?
      </Title>

      <div className={styles.searchBox}>
        <Input
          size="large"
          placeholder="Ask something..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={handleSearch}
          suffix={<SearchOutlined className={styles.searchIcon} />}
        />
        <Button type="primary" icon={<SendOutlined />} size="large" onClick={handleSearch} loading={loading}>
          {loading ? "Generating..." : "Go"}
        </Button>
      </div>

      {/* Streaming Response Display */}
      {loading && <Spin />}
      {error && <Paragraph type="danger">{error}</Paragraph>}
      {response && (
        <Card className={styles.responseCard}>
          <Title level={4}>AI Response:</Title>
          <Paragraph style={{ whiteSpace: "pre-wrap" }}>{response}</Paragraph>
        </Card>
      )}

      {/* Recent Conversations */}
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
    </div>
  );
}