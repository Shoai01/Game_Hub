import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  PersonOutlined,
  CheckCircleOutlined,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['', 'error', 'warning', 'info', 'success'];

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!form.username.trim()) return 'Username is required.';
    if (form.username.length < 3) return 'Username must be at least 3 characters.';
    if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      return 'Username can only contain letters, numbers, and underscores.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.';
    if (!form.password) return 'Password is required.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {/* Brand */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '-1px' }}
        >
          GameHub
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Create your account — it&apos;s free
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {error}
        </Alert>
      )}

      {/* Username */}
      <TextField
        fullWidth
        label="Username"
        name="username"
        value={form.username}
        onChange={handleChange}
        autoComplete="username"
        autoFocus
        sx={{ mb: 2 }}
        helperText="Letters, numbers, and underscores only"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Email */}
      <TextField
        fullWidth
        label="Email address"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        autoComplete="email"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Password */}
      <TextField
        fullWidth
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={form.password}
        onChange={handleChange}
        autoComplete="new-password"
        sx={{ mb: 0.5 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((v) => !v)}
                edge="end"
                size="small"
              >
                {showPassword ? (
                  <VisibilityOff sx={{ fontSize: 20 }} />
                ) : (
                  <Visibility sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Password strength bar */}
      {form.password.length > 0 && (
        <Box sx={{ mb: 2, mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={(passwordStrength / 4) * 100}
            color={strengthColors[passwordStrength]}
            sx={{ height: 4, borderRadius: 2, mb: 0.5 }}
          />
          <Typography variant="caption" color={`${strengthColors[passwordStrength]}.main`}>
            {strengthLabels[passwordStrength]} password
          </Typography>
        </Box>
      )}
      {form.password.length === 0 && <Box sx={{ mb: 2 }} />}

      {/* Confirm Password */}
      <TextField
        fullWidth
        label="Confirm password"
        name="confirmPassword"
        type={showConfirm ? 'text' : 'password'}
        value={form.confirmPassword}
        onChange={handleChange}
        autoComplete="new-password"
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {passwordsMatch ? (
                <CheckCircleOutlined sx={{ fontSize: 20, color: 'success.main' }} />
              ) : (
                <LockOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
              )}
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirm((v) => !v)}
                edge="end"
                size="small"
              >
                {showConfirm ? (
                  <VisibilityOff sx={{ fontSize: 20 }} />
                ) : (
                  <Visibility sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Submit */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        sx={{ mb: 3, py: 1.4 }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
      </Button>

      <Divider sx={{ mb: 3 }}>
        <Typography variant="caption" color="text.secondary">
          OR
        </Typography>
      </Divider>

      <Typography variant="body2" align="center" color="text.secondary">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login">
          Sign in
        </Link>
      </Typography>
    </Box>
  );
}
