"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api"; // Make sure this import is present
import { Input, Button, Typography, Card, Spin, Upload } from "antd";
import { SearchOutlined, SendOutlined, PaperClipOutlined } from "@ant-design/icons";
import styles from "./SearchChat.module.scss";
import { useRouter, useParams } from "next/navigation";

const { Title, Paragraph } = Typography;

export default function SearchChat({ directTo, prompt }: { directTo?: string, prompt?: string }) {
  const [query, setQuery] = useState(prompt || "");  
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");  
  const [file, setFile] = useState<File | null>(null);      
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

  const handleSearch = async () => {    
    if (!query.trim()) return;

    if (directTo === 'chat') {
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

    setResponse("");
    setLoading(true);
    setError("");

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
          suffix={
            <>
              <Upload
                beforeUpload={(file) => {
                  setFile(file);
                  return false;
                }}
                showUploadList={false}
              >
                <PaperClipOutlined style={{ marginRight: 12 }} />
              </Upload>
              <SearchOutlined className={styles.searchIcon} />
            </>
          }
        />
        <Button type="primary" icon={<SendOutlined />} size="large" onClick={handleSearch} loading={loading}>
          {loading ? "Generating..." : "Go"}
        </Button>
      </div>

      {file && (
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          Attached: {file.name}
        </Paragraph>
      )}

      {loading && <Spin />}
      {error && <Paragraph type="danger">{error}</Paragraph>}
      {response && (
        <Card className={styles.responseCard}>
          <Title level={4}>AI Response:</Title>
          <Paragraph style={{ whiteSpace: "pre-wrap" }}>{response}</Paragraph>
        </Card>
      )}
    </div>
  );
}