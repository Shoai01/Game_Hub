import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gameService from '../services/gameService';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  AddCircleOutlined,
  LoginOutlined,
  EmojiEventsOutlined,
  SportsEsportsOutlined,
  TrendingUpOutlined,
} from '@mui/icons-material';
import { useMemo } from 'react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stats = user?.stats || { totalGames: 0, wins: 0, losses: 0 };
  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  const recentMatches = useMemo(
    () => gameService.getMatchHistory(user?.id).slice(0, 5),
    [user?.id]
  );

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
      label: 'Win Rate',
      value: `${winRate}%`,
      icon: <TrendingUpOutlined />,
      color: '#E65100',
      bg: 'rgba(230,81,0,0.08)',
    },
  ];

  return (
    <Box>
      {/* ── Welcome Header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
          mb: 4,
          flexWrap: 'wrap',
        }}
      >
        <Avatar
          src={user?.avatar}
          alt={user?.username}
          sx={{ width: 56, height: 56, border: '3px solid', borderColor: 'primary.light' }}
        />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Welcome back, {user?.username}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ready for a game of Ludo?
          </Typography>
        </Box>
      </Box>

      {/* ── Quick Actions ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card
            sx={{
              cursor: 'pointer',
              border: '1.5px solid transparent',
              transition: 'all 0.25s ease',
              '&:hover': {
                borderColor: 'primary.main',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 25px rgba(27,79,138,0.12)',
              },
            }}
            onClick={() => navigate('/rooms/create')}
            id="action-create-room"
          >
            <CardContent sx={{ p: 3.5, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  backgroundColor: 'rgba(27,79,138,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AddCircleOutlined sx={{ fontSize: 28, color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Create Room
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start a new game and invite your friends
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card
            sx={{
              cursor: 'pointer',
              border: '1.5px solid transparent',
              transition: 'all 0.25s ease',
              '&:hover': {
                borderColor: 'primary.main',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 25px rgba(27,79,138,0.12)',
              },
            }}
            onClick={() => navigate('/rooms/join')}
            id="action-join-room"
          >
            <CardContent sx={{ p: 3.5, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  backgroundColor: 'rgba(46,117,182,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <LoginOutlined sx={{ fontSize: 28, color: 'secondary.main' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Join Room
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter a room code to join a friend&apos;s game
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Stats Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((s, i) => (
          <Grid size={{ xs: 4 }} key={i}>
            <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                <Box sx={{ color: s.color, backgroundColor: s.bg, borderRadius: 2, p: 1, display: 'inline-flex', mb: 1 }}>
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

      {/* ── Recent Matches ── */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
        Recent Matches
      </Typography>
      {recentMatches.length === 0 ? (
        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <SportsEsportsOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No matches played yet
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
              Create or join a room to start playing!
            </Typography>
            <Button variant="contained" size="small" onClick={() => navigate('/rooms/create')}>
              Create Room
            </Button>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {recentMatches.map((match) => {
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
