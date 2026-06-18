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
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack, MeetingRoomOutlined } from '@mui/icons-material';

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    if (code.trim().length < 6) {
      setError('Please enter a valid 6-character room code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const room = await roomService.joinRoom({
        roomCode: code.trim(),
      });
      navigate(`/room/${room.id}`);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to join room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto' }}>
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
        Join Room
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Enter the room code shared by your friend to join their game.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleJoin}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
              Room Code
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g. ABC123"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (error) setError('');
              }}
              autoFocus
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: 'center',
                  letterSpacing: '6px',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                },
              }}
              sx={{ mb: 3 }}
              id="room-code-input"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || code.trim().length < 6}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <MeetingRoomOutlined />
                )
              }
              sx={{ py: 1.4 }}
              id="join-room-btn"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
