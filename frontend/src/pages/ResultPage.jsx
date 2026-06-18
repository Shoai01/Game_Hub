import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gameService from '../services/gameService';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  EmojiEventsOutlined,
  ReplayOutlined,
  DashboardOutlined,
} from '@mui/icons-material';
import { PLAYER_COLORS } from '../engine/ludoBoard';

const PODIUM_STYLES = {
  1: { emoji: '🥇', bg: 'linear-gradient(135deg, #FFF8E1, #FFE082)', borderColor: '#FFD54F' },
  2: { emoji: '🥈', bg: 'linear-gradient(135deg, #FAFAFA, #E0E0E0)', borderColor: '#BDBDBD' },
  3: { emoji: '🥉', bg: 'linear-gradient(135deg, #FBE9E7, #FFCCBC)', borderColor: '#FFAB91' },
  4: { emoji: '', bg: '#F5F5F5', borderColor: '#E0E0E0' },
};

export default function ResultPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Find the most recent match for this room
  const match = useMemo(() => {
    const history = gameService.getMatchHistory(user?.id);
    return history.find((m) => m.roomId === roomId) || null;
  }, [roomId, user?.id]);

  if (!match) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Match result not found
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const winner = match.players.find((p) => p.id === match.winnerId);
  const sortedPlayers = [...match.players].sort((a, b) => {
    // Sort by tokens home (desc), then captures (desc)
    if (b.tokensHome !== a.tokensHome) return b.tokensHome - a.tokensHome;
    return b.captures - a.captures;
  });

  // Assign positions
  const rankedPlayers = sortedPlayers.map((p, i) => ({
    ...p,
    position: i + 1,
    isWinner: p.id === match.winnerId,
  }));

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 2 }}>
      {/* ── Trophy Header ── */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFF8E1, #FFE082)',
            mb: 2,
            animation: 'bounceIn 0.6s ease',
            '@keyframes bounceIn': {
              '0%': { transform: 'scale(0)', opacity: 0 },
              '60%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          <EmojiEventsOutlined sx={{ fontSize: 40, color: '#F9A825' }} />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          {winner?.username} Wins!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Match completed · Duration: {match.duration || '—'}
        </Typography>
      </Box>

      {/* ── Player Rankings ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        {rankedPlayers.map((player) => {
          const style = PODIUM_STYLES[player.position] || PODIUM_STYLES[4];
          const playerColor = PLAYER_COLORS[player.color] || '#999';

          return (
            <Card
              key={player.id}
              sx={{
                border: '2px solid',
                borderColor: style.borderColor,
                background: style.bg,
                boxShadow: player.isWinner ? '0 4px 20px rgba(255,193,7,0.2)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 2,
                  '&:last-child': { pb: 2 },
                }}
              >
                {/* Position */}
                <Typography
                  sx={{
                    fontSize: '1.8rem',
                    width: 40,
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  {style.emoji || `#${player.position}`}
                </Typography>

                {/* Color dot */}
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: playerColor,
                    flexShrink: 0,
                    border: '2px solid #fff',
                    boxShadow: `0 0 0 1px ${playerColor}40`,
                  }}
                />

                {/* Player Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {player.username}
                    {player.id === user?.id && (
                      <Chip
                        label="You"
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                      />
                    )}
                  </Typography>
                </Box>

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {player.tokensHome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Home
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {player.captures}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Captures
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ── Actions ── */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<ReplayOutlined />}
          onClick={() => navigate('/rooms/create')}
          sx={{ px: 3 }}
          id="play-again-btn"
        >
          Play Again
        </Button>
        <Button
          variant="outlined"
          startIcon={<DashboardOutlined />}
          onClick={() => navigate('/dashboard')}
          sx={{ px: 3 }}
          id="back-dashboard-btn"
        >
          Dashboard
        </Button>
      </Box>
    </Box>
  );
}
