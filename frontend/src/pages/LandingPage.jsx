import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  SportsEsportsOutlined,
  GroupOutlined,
  ShareOutlined,
  EmojiEventsOutlined,
  ArrowForward,
} from '@mui/icons-material';
import { useEffect } from 'react';

const features = [
  {
    icon: <GroupOutlined sx={{ fontSize: 40 }} />,
    title: 'Create a Room',
    desc: 'Set up a private game room in seconds. Choose the number of players and get a unique code to share.',
  },
  {
    icon: <ShareOutlined sx={{ fontSize: 40 }} />,
    title: 'Invite Friends',
    desc: 'Share your room code with friends. They join instantly — no downloads, no hassle.',
  },
  {
    icon: <EmojiEventsOutlined sx={{ fontSize: 40 }} />,
    title: 'Play & Win',
    desc: 'Enjoy classic Ludo with real-time multiplayer. Roll the dice, strategize, and claim victory!',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* ── Navbar ── */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255,255,255,0.85)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SportsEsportsOutlined sx={{ fontSize: 28, color: 'primary.main' }} />
              <Typography
                variant="h6"
                sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '-0.5px' }}
              >
                GameHub
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ fontWeight: 600 }}
                id="landing-sign-in"
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ borderRadius: 6, px: 3 }}
                id="landing-get-started"
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Hero Section ── */}
      <Box
        sx={{
          pt: { xs: 14, md: 18 },
          pb: { xs: 8, md: 14 },
          background: `
            radial-gradient(ellipse 80% 60% at 50% -20%, rgba(46,117,182,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 50%, rgba(27,79,138,0.08) 0%, transparent 50%),
            linear-gradient(180deg, #F5F7FA 0%, #ffffff 100%)
          `,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated floating shapes */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(27,79,138,0.08), rgba(46,117,182,0.04))',
            animation: 'float 8s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-25px) rotate(5deg)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '8%',
            width: 80,
            height: 80,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(46,117,182,0.1), rgba(27,79,138,0.05))',
            animation: 'float2 6s ease-in-out infinite',
            '@keyframes float2': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-18px) rotate(-8deg)' },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            left: '5%',
            width: 50,
            height: 50,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(27,79,138,0.06), transparent)',
            animation: 'float 10s ease-in-out infinite 1s',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            {/* Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 2,
                py: 0.6,
                borderRadius: 10,
                backgroundColor: 'rgba(27,79,138,0.08)',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.4 },
                  },
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Free to play · No downloads
              </Typography>
            </Box>

            {/* Headline */}
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                letterSpacing: '-1.5px',
                lineHeight: 1.15,
                color: 'text.primary',
                fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' },
                mb: 2.5,
              }}
            >
              Play Ludo with Friends,
              <br />
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #1B4F8A 0%, #2E75B6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Anywhere
              </Box>
            </Typography>

            {/* Subtext */}
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: 520,
                mx: 'auto',
                mb: 5,
                fontSize: { xs: '1rem', md: '1.15rem' },
              }}
            >
              Create a room, share the code, and play classic Ludo in real-time.
              Up to 4 players — right from your browser.
            </Typography>

            {/* CTAs */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/register')}
                sx={{
                  borderRadius: 8,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(27,79,138,0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(27,79,138,0.4)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
                id="hero-get-started"
              >
                Get Started — It&apos;s Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: 8,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  borderWidth: '1.5px',
                  '&:hover': {
                    borderWidth: '1.5px',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
                id="hero-sign-in"
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Features Section ── */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              mb: 1.5,
              color: 'text.primary',
              letterSpacing: '-0.5px',
            }}
          >
            How it works
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mb: { xs: 4, md: 6 },
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            Three simple steps to start playing Ludo with your friends online.
          </Typography>

          <Grid container spacing={isMobile ? 3 : 4} justifyContent="center">
            {features.map((f, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card
                  sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'rgba(0,0,0,0.06)',
                    borderRadius: 3,
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.light',
                      boxShadow: '0 8px 30px rgba(27,79,138,0.08)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    {/* Step number */}
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        backgroundColor: 'rgba(27,79,138,0.08)',
                        px: 1.5,
                        py: 0.4,
                        borderRadius: 10,
                        display: 'inline-block',
                        mb: 2,
                      }}
                    >
                      Step {i + 1}
                    </Typography>

                    {/* Icon */}
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{f.icon}</Box>

                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}
                    >
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {f.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box
        sx={{
          py: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
          backgroundColor: '#FAFBFC',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} GameHub. Built for fun.
        </Typography>
      </Box>
    </Box>
  );
}
