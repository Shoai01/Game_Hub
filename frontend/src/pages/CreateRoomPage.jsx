import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import roomService from '../services/roomService';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ArrowBack, ContentCopy, CheckCircleOutlined } from '@mui/icons-material';

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [maxPlayers, setMaxPlayers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdRoom, setCreatedRoom] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const room = await roomService.createRoom({ maxPlayers });
      setCreatedRoom(room);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdRoom.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToLobby = () => {
    navigate(`/room/${createdRoom.id}`);
  };

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto' }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 3, color: 'text.secondary' }}
        id="back-to-dashboard"
      >
        Back to Dashboard
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
        Create Room
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Set up a new Ludo game room and invite your friends.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!createdRoom ? (
        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Player Count */}
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
              Number of Players
            </Typography>
            <ToggleButtonGroup
              value={maxPlayers}
              exclusive
              onChange={(_, val) => val && setMaxPlayers(val)}
              sx={{ mb: 4, display: 'flex', gap: 1 }}
            >
              {[2, 3, 4].map((n) => (
                <ToggleButton
                  key={n}
                  value={n}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    borderRadius: '10px !important',
                    border: '1.5px solid !important',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderColor: maxPlayers === n ? 'primary.main !important' : 'divider !important',
                    color: maxPlayers === n ? 'primary.main' : 'text.secondary',
                    backgroundColor: maxPlayers === n ? 'rgba(27,79,138,0.06)' : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(27,79,138,0.04)' },
                  }}
                >
                  {n} Players
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* Create Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCreate}
              disabled={loading}
              sx={{ py: 1.4 }}
              id="create-room-btn"
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Room'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ── Room Created Success ── */
        <Card
          sx={{
            boxShadow: 'none',
            border: '2px solid',
            borderColor: 'success.main',
            backgroundColor: 'rgba(46,125,50,0.03)',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleOutlined sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Room Created!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Share this code with your friends to join:
            </Typography>

            {/* Room Code Display */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                backgroundColor: '#F5F7FA',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                mb: 3,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '4px',
                  color: 'primary.main',
                  fontFamily: 'monospace',
                }}
              >
                {createdRoom.code}
              </Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                <IconButton onClick={handleCopyCode} size="small" color="primary">
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleGoToLobby}
                sx={{ px: 4 }}
                id="go-to-lobby-btn"
              >
                Go to Lobby
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
