"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Input, Button, Typography, Dropdown, Menu, Flex, Divider, MenuProps } from "antd";
import { SendOutlined, DownOutlined, ThunderboltOutlined, CaretRightOutlined } from "@ant-design/icons";
import styles from "./AssistantChat.module.scss";
import { useRouter, useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const { Paragraph } = Typography;

export default function AssistantChat({ directTo, prompt }: { directTo?: string; prompt?: string }) {
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
        // TODO: This doesn't use messages. How do I get the thread's previous runs?
        // setMessages(data.messages || []);

        if (effectRan.current) return;
        effectRan.current = true;

        if (directTo) return;

        // if ((data.messages || []).length === 0 && query) handleSearch();
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
    setQuery("");
    let hasAppliedUserMessage = false;

    try {
      const formData = new FormData();
      formData.append("conversation_id", paramUuid || "");
      formData.append("instructions", "qualitative");
      formData.append("prompt", searchQuery);
      if (file) formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/assistant_stream`, {
        method: "POST",
        body: formData,
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
                if (!hasAppliedUserMessage) {
                  hasAppliedUserMessage = true;
                  setMessages((prev) => [...prev, { role: "user", content: searchQuery }]);
                }
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

  const stripJsonFromMessage = (message: string) => {
    const jsonStartIndex = message.indexOf("{");
    if (jsonStartIndex !== -1) {
      return message.substring(0, jsonStartIndex).trim();
    }
    return message;
  };

  const lastMessageIndex = messages.length - 1;

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
            <div className={styles.messageText}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {stripJsonFromMessage(msg.content)}
              </ReactMarkdown>
            </div>
            {idx === lastMessageIndex && actionSuggestions.length > 0 && (
              <Flex vertical wrap>
                <Divider style={{ margin: "14px 0" }} />
                <div className={styles.actionSuggestions}>
                  <Flex gap="small" wrap>
                    {actionSuggestions.map((action, idx) => {
                      if (action.type === "button") {
                        return (
                          <Button
                            color="default"
                            variant="filled"
                            size="middle"
                            key={idx}
                            onClick={() => handleActionClick(action.value)}
                            icon={<ThunderboltOutlined />}
                          >
                            {action.label}
                            <CaretRightOutlined />
                          </Button>
                        );
                      } else if (action.type === "dropdown") {
                        const items: MenuProps["items"] = action.options.map((option: any, idx: number) => ({
                          key: idx,
                          label: option.label,
                          onClick: () => handleActionClick(option.value),
                        }));

                        return (
                          <Dropdown key={idx} menu={{ items }}>
                            <Button>
                              {action.label} <DownOutlined />
                            </Button>
                          </Dropdown>
                        );
                      }
                      return null;
                    })}
                  </Flex>
                </div>
              </Flex>
            )}
          </div>
        ))}
      </div>

      <div className={styles.searchBox}>
        <Input.TextArea
          size="large"
          placeholder="Reply to Shimmel"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoSize={{ minRows: 1, maxRows: 4 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <Button type="primary" icon={<SendOutlined />} size="large" onClick={() => handleSearch()} loading={loading}>
          {loading ? "Generating..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
