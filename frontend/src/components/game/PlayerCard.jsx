import { Box, Avatar, Typography, Chip } from '@mui/material';
import { PLAYER_COLORS } from '../../engine/ludoBoard';

/**
 * Player info card shown around the game board.
 * @param {{ player: object, isCurrentTurn: boolean, isSelf: boolean }} props
 */
export default function PlayerCard({ player, isCurrentTurn, isSelf }) {
  const color = PLAYER_COLORS[player.color] || '#999';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.2,
        borderRadius: 2,
        border: '2px solid',
        borderColor: isCurrentTurn ? color : 'divider',
        backgroundColor: isCurrentTurn ? `${color}10` : '#fff',
        transition: 'all 0.3s ease',
        boxShadow: isCurrentTurn ? `0 0 12px ${color}30` : 'none',
        opacity: player.finished ? 0.6 : 1,
      }}
    >
      {/* Color indicator */}
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
          boxShadow: isCurrentTurn ? `0 0 8px ${color}` : 'none',
        }}
      />

      <Avatar
        src={player.avatar}
        alt={player.username}
        sx={{ width: 32, height: 32 }}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.82rem',
          }}
        >
          {player.username}
          {isSelf && (
            <Typography component="span" variant="caption" color="text.secondary">
              {' '}(You)
            </Typography>
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          {player.tokensHome}/4 home · {player.captures} captures
        </Typography>
      </Box>

      {player.finished && (
        <Chip
          label={`#${player.finishOrder}`}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            backgroundColor: player.finishOrder === 1 ? '#FFF8E1' : undefined,
            color: player.finishOrder === 1 ? '#F57F17' : undefined,
          }}
        />
      )}

      {isCurrentTurn && !player.finished && (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: color,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.4, transform: 'scale(0.8)' },
            },
          }}
        />
      )}
    </Box>
  );
}
