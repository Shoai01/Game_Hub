import { Box, Avatar, Typography, Chip } from '@mui/material';
import { StarOutlined } from '@mui/icons-material';

/**
 * Displays a single player slot in the lobby.
 * @param {{ player: object|null, isCurrentUser: boolean }} props
 */
export default function PlayerSlot({ player, isCurrentUser }) {
  if (!player) {
    return (
      <Box
        sx={{
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 3,
          p: 3,
          textAlign: 'center',
          minHeight: 140,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.01)',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.04)',
            mb: 1,
          }}
        />
        <Typography variant="body2" color="text.disabled" sx={{ fontWeight: 500 }}>
          Waiting for player...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: '2px solid',
        borderColor: isCurrentUser ? 'primary.main' : 'divider',
        borderRadius: 3,
        p: 3,
        textAlign: 'center',
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isCurrentUser ? 'rgba(27,79,138,0.03)' : '#fff',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Host Crown */}
      {player.isHost && (
        <StarOutlined
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            fontSize: 20,
            color: '#F9A825',
          }}
        />
      )}

      <Avatar
        src={player.avatar}
        alt={player.username}
        sx={{
          width: 48,
          height: 48,
          mb: 1,
          border: '2px solid',
          borderColor: player.isReady ? 'success.main' : 'divider',
        }}
      />

      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 0.5,
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {player.username}
        {isCurrentUser && (
          <Typography component="span" variant="caption" color="text.secondary">
            {' '}
            (You)
          </Typography>
        )}
      </Typography>

      <Chip
        label={player.isReady ? 'Ready' : 'Not Ready'}
        size="small"
        color={player.isReady ? 'success' : 'default'}
        variant={player.isReady ? 'filled' : 'outlined'}
        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
      />
    </Box>
  );
}
