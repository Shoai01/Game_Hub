import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import roomService from '../services/roomService';
import gameService from '../services/gameService';
import { getValidMoves } from '../engine/ludoEngine';
import { PLAYER_COLORS } from '../engine/ludoBoard';
import LudoBoard from '../components/game/LudoBoard';
import Dice from '../components/game/Dice';
import PlayerCard from '../components/game/PlayerCard';
import GameLog from '../components/game/GameLog';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import '../components/game/GameBoard.css';

export default function GameBoardPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [gameState, setGameState] = useState(null);
  const [room, setRoom] = useState(null);
  const [validMovesList, setValidMovesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize room info on load
  useEffect(() => {
    const initializeRoom = async () => {
      try {
        const r = await roomService.getRoom(roomId);
        if (!r) {
          navigate('/dashboard');
          return;
        }
        setRoom(r);
      } catch {
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    initializeRoom();
  }, [roomId, navigate]);

  // Poll game state from backend every 1 second
  useEffect(() => {
    let active = true;

    const fetchState = async () => {
      try {
        const state = await roomService.getGameState(roomId);
        if (active && state) {
          setGameState(state);
        }
      } catch (err) {
        console.error('Failed to get game state:', err);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [roomId]);

  // Get current player info
  const currentPlayer = gameState ? gameState.players[gameState.currentPlayerIndex] : null;
  const isMyTurn = currentPlayer?.id === user?.id;

  // Handle token click
  const handleTokenClick = useCallback(
    async (tokenId) => {
      if (!gameState || gameState.turnPhase !== 'MOVE') return;
      // Safety client-side check
      const currentMoves = getValidMoves(gameState, gameState.diceValue);
      if (!currentMoves.includes(tokenId)) return;

      try {
        const newState = await roomService.moveToken(roomId, tokenId);
        setGameState(newState);
        setValidMovesList([]);
      } catch (err) {
        console.error('Failed to move token:', err);
      }
    },
    [gameState, roomId]
  );

  // Handle dice roll
  const handleRoll = useCallback(async () => {
    if (!gameState || !isMyTurn || gameState.turnPhase !== 'ROLL') return;

    try {
      const newState = await roomService.rollDice(roomId);
      setGameState(newState);
    } catch (err) {
      console.error('Failed to roll dice:', err);
    }
  }, [gameState, isMyTurn, roomId]);

  // Compute valid moves when it becomes user's turn to move
  useEffect(() => {
    if (gameState && isMyTurn && gameState.turnPhase === 'MOVE') {
      const moves = getValidMoves(gameState, gameState.diceValue);
      setValidMovesList(moves);

      // Auto-move if only one valid option
      if (moves.length === 1) {
        const timer = setTimeout(() => {
          handleTokenClick(moves[0]);
        }, 600);
        return () => clearTimeout(timer);
      }
    } else {
      setValidMovesList([]);
    }
  }, [gameState, isMyTurn, handleTokenClick]);

  // Check if game is over
  useEffect(() => {
    if (gameState && gameState.gameOver && room) {
      const winner = gameState.players.find((p) => p.id === gameState.winnerId);
      gameService.saveMatchResult({
        roomId: room.id,
        roomCode: room.code,
        players: gameState.players,
        winnerId: gameState.winnerId,
        winnerName: winner?.username || 'Unknown',
        duration: getGameDuration(gameState.startedAt),
        finishedAt: new Date().toISOString(),
      });

      const timer = setTimeout(() => {
        navigate(`/result/${roomId}`);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [gameState, room, navigate, roomId]);

  if (loading || !gameState) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Turn Indicator */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {gameState.gameOver
            ? '🏆 Game Over!'
            : isMyTurn
              ? 'Your Turn'
              : `${currentPlayer?.username}'s Turn`}
        </Typography>
        {!gameState.gameOver && (
          <Typography variant="body2" color="text.secondary">
            {gameState.turnPhase === 'ROLL'
              ? isMyTurn
                ? 'Roll the dice!'
                : 'Waiting for dice roll...'
              : isMyTurn
                ? 'Select a token to move'
                : 'Waiting for move...'}
          </Typography>
        )}
      </Box>

      <div className="game-board-container">
        {/* ── Left: Player Cards ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 200 }}>
          {gameState.players.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              isCurrentTurn={currentPlayer?.id === p.id}
              isSelf={p.id === user?.id}
            />
          ))}

          {/* Dice below player cards on desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', mt: 2 }}>
            <Dice
              value={gameState.diceValue}
              canRoll={isMyTurn && gameState.turnPhase === 'ROLL'}
              onRoll={handleRoll}
              playerColor={currentPlayer ? PLAYER_COLORS[currentPlayer.color] : undefined}
            />
          </Box>
        </Box>

        {/* ── Center: Board ── */}
        <div className="game-board-wrapper">
          <LudoBoard
            gameState={gameState}
            validMoves={validMovesList}
            onTokenClick={(tokenId) => handleTokenClick(tokenId)}
          />

          {/* Dice on mobile — below the board */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
              mt: 2,
            }}
          >
            <Dice
              value={gameState.diceValue}
              canRoll={isMyTurn && gameState.turnPhase === 'ROLL'}
              onRoll={handleRoll}
              playerColor={currentPlayer ? PLAYER_COLORS[currentPlayer.color] : undefined}
            />
          </Box>
        </div>

        {/* ── Right: Game Log ── */}
        <div className="game-side-panel">
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Game Log
          </Typography>
          <GameLog log={gameState.log} />

          {gameState.gameOver && (
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate(`/result/${roomId}`)}
              sx={{ mt: 1 }}
            >
              View Results
            </Button>
          )}
        </div>
      </div>
    </Box>
  );
}

function getGameDuration(startedAt) {
  const start = new Date(startedAt);
  const now = new Date();
  const diffMs = now - start;
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  return `${mins}m ${secs}s`;
}
