import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import roomService from '../services/roomService';
import PlayerSlot from '../components/lobby/PlayerSlot';
import ChatPanel from '../components/lobby/ChatPanel';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  ContentCopy,
  PlayArrowOutlined,
  CheckCircleOutlined,
  CancelOutlined,
  ExitToAppOutlined,
} from '@mui/icons-material';

export default function LobbyPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchRoom = async () => {
      try {
        const r = await roomService.getRoom(roomId);
        if (!active) return;
        if (!r || r.status === 'closed') {
          setError('This room no longer exists.');
          setRoom(null);
        } else if (r.status === 'in_game') {
          navigate(`/game/${roomId}`, { replace: true });
        } else {
          setRoom(r);
        }
      } catch {
        if (active) setError('Failed to load room.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRoom();
    // Poll for room updates every 2 seconds (simulates WebSocket)
    const interval = setInterval(fetchRoom, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [roomId, navigate]);

  const currentPlayer = room?.players?.find((p) => p.id === user?.id);
  const isHost = room?.hostId === user?.id;
  const allReady = room?.players?.every((p) => p.isReady) && room?.players?.length >= 2;

  const handleToggleReady = async () => {
    setActionLoading(true);
    try {
      const updated = await roomService.toggleReady({ roomId });
      setRoom(updated);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartGame = async () => {
    setActionLoading(true);
    try {
      await roomService.startGame({ roomId });
      navigate(`/game/${roomId}`);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    await roomService.leaveRoom({ roomId });
    navigate('/dashboard');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !room) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center', py: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  // Build 4 slots (fill empty ones with null)
  const slots = [];
  for (let i = 0; i < room.maxPlayers; i++) {
    slots.push(room.players[i] || null);
  }

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={() => navigate('/dashboard')} size="small">
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Lobby
          </Typography>
          <Chip
            label={`${room.players.length}/${room.maxPlayers} Players`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Room Code */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#F5F7FA',
            borderRadius: 2,
            px: 2,
            py: 0.8,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            Room Code:
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 800,
              letterSpacing: '2px',
              color: 'primary.main',
              fontFamily: 'monospace',
            }}
          >
            {room.code}
          </Typography>
          <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
            <IconButton onClick={handleCopyCode} size="small" color="primary">
              <ContentCopy sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ── Player Slots ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2}>
            {slots.map((player, i) => (
              <Grid size={{ xs: 6, sm: 3 }} key={i}>
                <PlayerSlot player={player} isCurrentUser={player?.id === user?.id} />
              </Grid>
            ))}
          </Grid>

          {/* ── Action Buttons ── */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
            {/* Ready Toggle */}
            <Button
              variant={currentPlayer?.isReady ? 'outlined' : 'contained'}
              color={currentPlayer?.isReady ? 'error' : 'success'}
              startIcon={currentPlayer?.isReady ? <CancelOutlined /> : <CheckCircleOutlined />}
              onClick={handleToggleReady}
              disabled={actionLoading}
              sx={{ minWidth: 140 }}
              id="toggle-ready-btn"
            >
              {currentPlayer?.isReady ? 'Not Ready' : 'Ready'}
            </Button>

            {/* Start Game (Host only) */}
            {isHost && (
              <Button
                variant="contained"
                startIcon={
                  actionLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <PlayArrowOutlined />
                  )
                }
                onClick={handleStartGame}
                disabled={!allReady || actionLoading}
                sx={{ minWidth: 140 }}
                id="start-game-btn"
              >
                Start Game
              </Button>
            )}

            {/* Leave Room */}
            <Button
              variant="text"
              color="error"
              startIcon={<ExitToAppOutlined />}
              onClick={handleLeave}
              sx={{ ml: 'auto' }}
              id="leave-room-btn"
            >
              Leave Room
            </Button>
          </Box>
        </Grid>

        {/* ── Chat Panel ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ChatPanel roomId={roomId} userId={user.id} username={user.username} />
        </Grid>
      </Grid>
    </Box>
  );
}
