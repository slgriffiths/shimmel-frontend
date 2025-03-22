"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Input, Button, Typography, Dropdown, Menu } from "antd";
import { SendOutlined } from "@ant-design/icons";
import styles from "./SearchChat.module.scss";
import { useRouter, useParams } from "next/navigation";

const { Paragraph } = Typography;

export default function SearchChat({ directTo, prompt }: { directTo?: string; prompt?: string }) {
  const [query, setQuery] = useState(prompt || "");  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [actionSuggestions, setActionSuggestions] = useState<any[]>([]);
  const router = useRouter();
  const params = useParams();
  const paramUuid = params?.uuid as string;
  const effectRan = useRef(false);

  useEffect(() => {
    if (!paramUuid) return;

    const fetchConversation = async () => {
      try {
        const { data } = await api.get(`/conversations/${paramUuid}`);
        const msgs = data.messages || data.data?.messages || [];
        setMessages(msgs.map(({ role, content }: any) => ({ role, content })));

        // After we've loaded the conversation, we can try and auto-run the search
        if (effectRan.current) return;
        effectRan.current = true;

        if (directTo) return;

        console.log({ msgs, query})
        if (msgs.length === 0 && query) handleSearch();        
      } catch (err) {
        console.error("Failed to load conversation:", err);
      }
    };

    fetchConversation();
  }, [paramUuid]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    if (directTo === "chat") {
      try {
        const res = await api.post("conversations", {
          title: searchQuery,
        });

        const uuid = res.data.uuid || res.data.data?.uuid || res.data.id;

        return router.push(`/chat/${uuid}?p=${encodeURIComponent(searchQuery)}`);
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
        // Update this to use research template
        formData.append("instructions", "qualitative")
        formData.append("prompt", searchQuery);
        formData.append("file", file);

        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/stream`, {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: searchQuery,
            conversation_id: paramUuid,
            // Update this to use research template
            instructions: "qualitative"
        }),
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
                  setMessages((prev) => [...prev, { role: "user", content: searchQuery }]);
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
              } else if (parsed.type === "action_suggestions") {
                setActionSuggestions(parsed.follow_up_actions || []);
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

  const handleActionClick = (value: string) => {
    setQuery(value);
    handleSearch(value);
  };

  console.log({ actionSuggestions})

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

      {actionSuggestions.length > 0 && (
        <div className={styles.actionSuggestions}>
          {actionSuggestions.map((action, idx) => {
            if (action.type === "button") {
              return (
                <Button key={idx} onClick={() => handleActionClick(action.value)}>
                  {action.label}
                </Button>
              );
            } else if (action.type === "dropdown") {
              const menu = (
                <Menu>
                  {action.options.map((option: any, idx: number) => (
                    <Menu.Item key={idx} onClick={() => handleActionClick(option.value)}>
                      {option.label}
                    </Menu.Item>
                  ))}
                </Menu>
              );
              return (
                <Dropdown key={idx} overlay={menu}>
                  <Button>{action.label}</Button>
                </Dropdown>
              );
            }
            return null;
          })}
        </div>
      )}

      <div className={styles.searchBox}>
        <Input.TextArea
          rows={1}
          size="large"
          placeholder="Reply to Shimmel"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={() => handleSearch()}
        />
        <Button type="primary" icon={<SendOutlined />} size="large" onClick={() => handleSearch()} loading={loading}>
          {loading ? "Generating..." : "Send"}
        </Button>
      </div>
    </div>
  );
}