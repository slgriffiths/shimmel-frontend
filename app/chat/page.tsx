"use client";

import { useState } from "react";
import { Input, Button, Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function ChatStream() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!prompt.trim()) return;

    setResponse("");
    setLoading(true);
    setError("");

    const instructions = "You are a research assistant helping users extract insights from transcripts or research findings. Ask smart, structured questions and guide them toward clarity.";

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, instructions }),
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
                setResponse((prev) => prev + parsed.content);
            } else if (parsed.type === "done") {
                // handle finish if needed
            } else if (parsed.type === "error") {
                setError(parsed.message || "Unexpected error");
            }
            } catch {
            console.warn("Non-JSON chunk:", data);
            }
        });
        
        // setResponse((prev) => prev + chunk.replace(/^data:\s*/gm, "").replace(/\r?\n/g, ""));        
      }
    } catch (err: any) {
      console.error("Streaming failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 700, margin: "40px auto", padding: 24 }}>
      <Title level={3}>Research Assistant</Title>

      <Input.TextArea
        rows={4}
        placeholder="Paste your transcript or describe your research goal..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      <Button type="primary" onClick={handleSend} loading={loading} disabled={!prompt}>
        {loading ? "Generating..." : "Generate Insights"}
      </Button>

      {error && <Paragraph type="danger" style={{ marginTop: 16 }}>{error}</Paragraph>}

      {response && (
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>AI Response:</Title>
          <Paragraph style={{ whiteSpace: "pre-wrap" }}>{response}</Paragraph>
        </Card>
      )}
    </Card>
  );
}