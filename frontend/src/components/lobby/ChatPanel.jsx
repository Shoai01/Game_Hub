import { useState, useEffect, useRef, useCallback } from 'react';
import chatService from '../../services/chatService';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import { SendOutlined } from '@mui/icons-material';

/**
 * Chat panel for lobby and in-game use.
 * Polls the backend every 2 seconds for new messages.
 * @param {{ roomId: string, userId: string, username: string }} props
 */
export default function ChatPanel({ roomId, userId, username }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const lastMsgIdRef = useRef(null);

  // Fetch all messages on mount / roomId change
  useEffect(() => {
    let active = true;

    const fetchAll = async () => {
      try {
        const msgs = await chatService.getMessages(roomId);
        if (!active) return;
        setMessages(msgs);
        if (msgs.length > 0) {
          lastMsgIdRef.current = msgs[msgs.length - 1].id;
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    fetchAll();
    return () => { active = false; };
  }, [roomId]);

  const pollingActiveRef = useRef(false);

  // Poll for new messages every 2 seconds
  useEffect(() => {
    let active = true;

    const poll = async () => {
      if (pollingActiveRef.current) return;
      pollingActiveRef.current = true;
      try {
        const newMsgs = await chatService.getMessages(roomId, lastMsgIdRef.current);
        if (!active) return;
        if (newMsgs.length > 0) {
          setMessages((prev) => [...prev, ...newMsgs]);
          lastMsgIdRef.current = newMsgs[newMsgs.length - 1].id;
        }
      } catch {
        // Silently ignore poll errors
      } finally {
        pollingActiveRef.current = false;
      }
    };

    const interval = setInterval(poll, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      const msg = await chatService.sendMessage({ roomId, text: text.trim() });
      setMessages((prev) => [...prev, msg]);
      lastMsgIdRef.current = msg.id;
      setText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  }, [text, sending, roomId]);

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 400,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#FAFBFC',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Chat
        </Typography>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {messages.length === 0 && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ textAlign: 'center', py: 3 }}
          >
            No messages yet. Say hello!
          </Typography>
        )}
        {messages.map((msg) => {
          const isOwn = msg.userId === userId;
          return (
            <Box
              key={msg.id}
              sx={{
                alignSelf: isOwn ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}
            >
              {!isOwn && (
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: 'primary.main', ml: 0.5 }}
                >
                  {msg.username}
                </Typography>
              )}
              <Box
                sx={{
                  px: 1.5,
                  py: 0.8,
                  borderRadius: 2,
                  backgroundColor: isOwn ? 'primary.main' : '#F0F2F5',
                  color: isOwn ? '#fff' : 'text.primary',
                }}
              >
                <Typography variant="body2" sx={{ fontSize: '0.82rem', wordBreak: 'break-word' }}>
                  {msg.text}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontSize: '0.65rem', ml: 0.5 }}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{
          display: 'flex',
          gap: 1,
          px: 1.5,
          py: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#FAFBFC',
        }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 6,
              backgroundColor: '#fff',
              fontSize: '0.85rem',
            },
          }}
          id="chat-input"
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!text.trim() || sending}
          size="small"
          id="chat-send-btn"
        >
          <SendOutlined fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}
