"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Input, Button, Typography, Spin, Upload } from "antd";
import { SendOutlined, PaperClipOutlined } from "@ant-design/icons";
import styles from "./SearchChat.module.scss";
import { useRouter, useParams } from "next/navigation";

const { Title, Paragraph } = Typography;

export default function SearchChat({ directTo, prompt }: { directTo?: string; prompt?: string }) {
  const [query, setQuery] = useState(prompt || "");  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const router = useRouter();
  const params = useParams();
  const paramUuid = params?.uuid as string;
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    if (directTo) return;

    if (query) {
      handleSearch();
    }
  }, []);

  useEffect(() => {
    if (!paramUuid) return;

    const fetchConversation = async () => {
      try {
        const { data } = await api.get(`/conversations/${paramUuid}`);
        const msg = data.messages || data.data?.messages || [];
        setMessages(msg.map(({ role, content }: any) => ({ role, content })));
      } catch (err) {
        console.error("Failed to load conversation:", err);
      }
    };

    fetchConversation();
  }, [paramUuid]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    if (directTo === "chat") {
      try {
        const res = await api.post("conversations", {
          title: query,
        });

        const uuid = res.data.uuid || res.data.data?.uuid || res.data.id;

        return router.push(`/chat/${uuid}?p=${encodeURIComponent(query)}`);
      } catch (err) {
        console.error("Error creating conversation:", err);
        setError("Something went wrong. Please try again.");
        return;
      }
    }
    
    setLoading(true);
    setError("");

    let hasAppliedUserMessage = false;

    try {
      let res;

      if (file) {
        const formData = new FormData();
        formData.append("conversation_id", paramUuid || "");
        formData.append("prompt", query);
        formData.append("file", file);

        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/stream`, {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: query, conversation_id: paramUuid }),
        });
      }

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
                if (!hasAppliedUserMessage) {
                  hasAppliedUserMessage = true;
                  setMessages((prev) => [...prev, { role: "user", content: query }]);
                }
                
                // Add or update AI response
                setMessages((prev) => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage?.role === "assistant") {
                    return prev.map((msg, index, arr) =>
                      index === arr.length - 1 ? { ...msg, content: msg.content + parsed.content } : msg
                    );
                  } else {
                    return [...prev, { role: "assistant", content: parsed.content }];
                  }
                });
              } else if (parsed.type === "done") {
                setLoading(false);
              } else if (parsed.type === "error") {
                setError(parsed.message || "Unexpected error");
              }
            } catch (err) {
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
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.message} ${msg.role === "user" ? styles.userMessage : styles.aiMessage}`}>
            <div className={styles.messageHeader}>
              {msg.role === "user" ? (
                <>
                  <span className={styles.userIcon}>🧑</span> <strong>You</strong>
                </>
              ) : (
                <>
                  <span className={styles.aiIcon}>🤖</span> <strong>Shimmel</strong>
                </>
              )}
            </div>
            <Paragraph className={styles.messageText}>{msg.content}</Paragraph>
          </div>
        ))}
      </div>

      <div className={styles.searchBox}>
        <Input.TextArea
          rows={1}
          size="large"
          placeholder="Reply to Shimmel"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Button type="primary" icon={<SendOutlined />} size="large" onClick={handleSearch} loading={loading}>
          {loading ? "Generating..." : "Send"}
        </Button>
      </div>
    </div>
  );
}