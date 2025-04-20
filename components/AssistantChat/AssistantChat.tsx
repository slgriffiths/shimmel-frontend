'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Input, Button, Dropdown, Flex, Divider, MenuProps, Upload, UploadProps, message as antdMessage } from 'antd';
import { SendOutlined, DownOutlined, ThunderboltOutlined, CaretRightOutlined, InboxOutlined } from '@ant-design/icons';
import styles from './AssistantChat.module.scss';
import { useRouter, useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const MESSAGE_CONTAINER_ID = 'messages-container';
const DEFAULT_ASSISTANT_ID = 1; // Refers to our default Assistant, should always be 1.

export default function AssistantChat({
  directTo,
  prompt,
  searchOnly,
  assistantId = DEFAULT_ASSISTANT_ID,
  projectId,
}: {
  directTo?: string;
  prompt?: string;
  searchOnly?: boolean;
  assistantId?: number;
  projectId?: number;
}) {
  const [query, setQuery] = useState(prompt || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [actionSuggestions, setActionSuggestions] = useState<any[]>([]);
  const router = useRouter();
  const params = useParams();
  const paramUuid = params?.uuid as string;
  const [conversationUuid, setConversationUuid] = useState<string | null>(paramUuid);

  const effectRan = useRef(false);
  const shouldScrollRef = useRef(false);

  const fetchConversation = async () => {
    try {
      const { data } = await api.get(`/conversations/${conversationUuid}`);

      const threadId = data.openai_thread_id;
      if (threadId) {
        const threadMessagesRes = await api.get(`/conversations/${data.id}/messages`);
        const threadMessages = threadMessagesRes.data || [];
        const formatted = threadMessages
          .map((m: any) => ({
            role: m.role,
            content: m.content[0]?.text?.value || '',
          }))
          .reverse();

        setMessages(formatted);

        const container = document.getElementById(MESSAGE_CONTAINER_ID);
        if (container) {
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }
      }

      if (effectRan.current) return;
      effectRan.current = true;

      if (directTo) return;
    } catch (err) {
      console.error('Failed to load conversation:', err);
      antdMessage.error('Error loading conversation.');
      router.push('/dashboard');
    }
  };

  // Fetch conversation messages when a conversation uuid is first set
  // Be mindful of this and make sure it doesn't conflict with the other hook
  // useEffect(() => {
  //   if (messages.length === 0) return;
  //   if (!conversationUuid) return;

  //   fetchConversation();

  //   console.log({ m: messages.length, conversationUuid });
  // }, [conversationUuid, messages.length]);

  useEffect(() => {
    // Only fetch the conversation if the url slug has a conversation id on load
    if (!conversationUuid) return;

    fetchConversation();
  }, [conversationUuid, directTo]);

  // Fetch conversation messages
  useEffect(() => {
    // TODO if (messages.length > 0 && !conversationUuid)

    if (shouldScrollRef.current) {
      const container = document.getElementById(MESSAGE_CONTAINER_ID);
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
      shouldScrollRef.current = false;
    }
  }, [messages]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim() && !file) return;

    if (directTo === 'chat') {
      try {
        const res = await api.post('conversations', {
          title: searchQuery,
        });

        const uuid = res.data.uuid || res.data.data?.uuid || res.data.id;
        return router.push(`/chat/${uuid}?p=${encodeURIComponent(searchQuery)}`);
      } catch (err) {
        console.error('Error creating conversation:', err);
        setError('Something went wrong. Please try again.');
        return;
      }
    }

    setLoading(true);
    setError('');
    setQuery('');
    setActionSuggestions([]);

    setMessages((prev) => {
      let userMessage = searchQuery;

      if (file) {
        userMessage += `\nUploaded file: ${file?.name}`;
      }

      shouldScrollRef.current = true;

      return [...prev, { role: 'user', content: userMessage }];
    });

    try {
      const formData = new FormData();
      formData.append('conversation_uuid', conversationUuid || '');
      formData.append('instructions', 'qualitative');
      formData.append('assistant_id', assistantId.toString());
      formData.append('project_id', projectId?.toString() || '');
      formData.append('prompt', searchQuery);
      if (file) formData.append('file', file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/assistant_stream`, {
        method: 'POST',
        body: formData,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        chunk
          .split('\n\n')
          .filter(Boolean)
          .forEach((line) => {
            const data = line.replace(/^data:\s*/, '').trim();
            try {
              const parsed = JSON.parse(data);

              if (!conversationUuid && parsed.conversation_uuid) {
                // Set the conversation_uuid from the first payload event
                // Don't use Next.js router here, as it will cause a full page reload
                setConversationUuid(parsed.conversation_uuid);
                window.history.pushState({}, '', `/chat/${parsed.conversation_uuid}`);
              }

              if (parsed.type === 'content') {
                // Uncomment if we want streaming service to input the user message - will have a ux delay though.
                // if (!hasAppliedUserMessage) {
                //   hasAppliedUserMessage = true;
                //   let userMessage = searchQuery;

                //   if (file) {
                //     userMessage += `\nUploaded file: ${file?.name}`;
                //   }

                //   setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
                // }
                setMessages((prev) => {
                  const lastMessage = prev[prev.length - 1];

                  shouldScrollRef.current = true;

                  if (lastMessage?.role === 'assistant') {
                    return prev.map((msg, index, arr) =>
                      index === arr.length - 1 ? { ...msg, content: msg.content + parsed.content } : msg
                    );
                  } else {
                    return [...prev, { role: 'assistant', content: parsed.content }];
                  }
                });
              } else if (parsed.type === 'action_suggestions') {
                setActionSuggestions(parsed.follow_up_actions || []);
              } else if (parsed.type === 'done') {
                setLoading(false);
                setFile(null);
              } else if (parsed.type === 'error') {
                setError(parsed.message || 'Unexpected error');
              }
            } catch (err) {
              console.warn('Non-JSON chunk:', data);
            }
          });
      }
    } catch (err: any) {
      console.error('Streaming failed:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (value: string) => {
    setQuery(value);
    handleSearch(value);
  };

  const stripJsonFromMessage = (message: string) => {
    const jsonStartIndex = message.indexOf('{');
    if (jsonStartIndex !== -1) {
      return message.substring(0, jsonStartIndex).trim();
    }
    return message;
  };

  const lastMessageIndex = messages.length - 1;

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    fileList: file ? [file] : [],
    onChange(info) {
      const selectedFile = info.fileList?.[0];
      if (selectedFile?.originFileObj) setFile(selectedFile.originFileObj as File);
    },
    onDrop(e) {
      const selectedFile = e.dataTransfer.files?.[0];
      if (selectedFile) setFile(selectedFile);
    },
  };

  const containerClassName = searchOnly ? styles.searchOnlyContainer : '';

  return (
    <div className={`${styles.chatContainer} ${containerClassName}`}>
      <div id={MESSAGE_CONTAINER_ID} className={styles.messagesContainer}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
            <div className={styles.messageHeader}>
              {msg.role === 'user' ? (
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
                <Divider style={{ margin: '14px 0' }} />
                <div className={styles.actionSuggestions}>
                  <Flex gap='small' wrap>
                    {actionSuggestions.map((action, idx) => {
                      if (action.type === 'button') {
                        return (
                          <Button
                            color='default'
                            variant='filled'
                            size='middle'
                            key={idx}
                            onClick={() => handleActionClick(action.value)}
                            icon={<ThunderboltOutlined />}
                          >
                            {action.label}
                            <CaretRightOutlined />
                          </Button>
                        );
                      } else if (action.type === 'dropdown') {
                        const items: MenuProps['items'] = action.options.map((option: any, idx: number) => ({
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

      <div className={styles.searchBoxContainer}>
        <div className={styles.searchBox}>
          <Input.TextArea
            size='large'
            placeholder='Reply to Shimmel'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoSize={{ minRows: 1, maxRows: 4 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Button type='primary' icon={<SendOutlined />} size='large' onClick={() => handleSearch()} loading={loading}>
            {loading ? 'Generating...' : 'Send'}
          </Button>
        </div>
        <div className={styles.fileUpload}>
          <Upload.Dragger {...uploadProps}>
            <p className='ant-upload-drag-icon'>
              <InboxOutlined />
            </p>
          </Upload.Dragger>
        </div>
      </div>
    </div>
  );
}
