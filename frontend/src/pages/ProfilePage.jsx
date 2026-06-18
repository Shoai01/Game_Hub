import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import gameService from '../services/gameService';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  SportsEsportsOutlined,
  EmojiEventsOutlined,
  TrendingUpOutlined,
  CalendarTodayOutlined,
} from '@mui/icons-material';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const stats = user?.stats || { totalGames: 0, wins: 0, losses: 0 };
  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  const matches = useMemo(
    () => gameService.getMatchHistory(user?.id),
    [user?.id]
  );

  const handleSaveUsername = async () => {
    if (!newUsername.trim() || newUsername.trim() === user?.username) {
      setEditingName(false);
      return;
    }
    try {
      await authService.updateProfile({ username: newUsername.trim() });
      refreshUser();
      setEditingName(false);
      setSuccess('Username updated!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const statCards = [
    {
      label: 'Total Games',
      value: stats.totalGames,
      icon: <SportsEsportsOutlined />,
      color: '#1B4F8A',
      bg: 'rgba(27,79,138,0.08)',
    },
    {
      label: 'Wins',
      value: stats.wins,
      icon: <EmojiEventsOutlined />,
      color: '#2E7D32',
      bg: 'rgba(46,125,50,0.08)',
    },
    {
      label: 'Losses',
      value: stats.losses,
      icon: <CloseOutlined />,
      color: '#C62828',
      bg: 'rgba(198,40,40,0.08)',
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`,
      icon: <TrendingUpOutlined />,
      color: '#E65100',
      bg: 'rgba(230,81,0,0.08)',
    },
  ];

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 3, color: 'text.secondary' }}
      >
        Back to Dashboard
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* ── Profile Header ── */}
      <Card sx={{ mb: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Avatar
              src={user?.avatar}
              alt={user?.username}
              sx={{
                width: 80,
                height: 80,
                border: '3px solid',
                borderColor: 'primary.light',
              }}
            />
            <Box sx={{ flex: 1, minWidth: 200 }}>
              {editingName ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    size="small"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    autoFocus
                    sx={{ maxWidth: 220 }}
                  />
                  <IconButton size="small" color="primary" onClick={handleSaveUsername}>
                    <CheckOutlined fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => { setEditingName(false); setNewUsername(user?.username); }}>
                    <CloseOutlined fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {user?.username}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setEditingName(true)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <EditOutlined sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <CalendarTodayOutlined sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled">
                  Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ── Stats ── */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statCards.map((s, i) => (
          <Grid size={{ xs: 6, sm: 3 }} key={i}>
            <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box
                  sx={{
                    color: s.color,
                    backgroundColor: s.bg,
                    borderRadius: 2,
                    p: 0.8,
                    display: 'inline-flex',
                    mb: 1,
                  }}
                >
                  {s.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {s.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Match History ── */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
        Match History
      </Typography>
      {matches.length === 0 ? (
        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <SportsEsportsOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No matches played yet
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 600, color: 'text.secondary' } }}>
                <TableCell>Date</TableCell>
                <TableCell>Players</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Room</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matches.map((match) => {
                const won = match.winnerId === user?.id;
                return (
                  <TableRow key={match.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(match.finishedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {match.players.map((p) => p.username).join(', ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={won ? 'Won' : 'Lost'}
                        size="small"
                        color={won ? 'success' : 'default'}
                        variant={won ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {match.duration || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}
                      >
                        {match.roomCode}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
