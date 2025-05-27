import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, loading, user } = useAuth();

  // Получаем предыдущий маршрут, если есть
  const from = location.state?.from?.pathname || '/';

  // Если пользователь уже авторизован, перенаправляем его
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username, password);
      // После успешного входа перенаправление произойдет через useEffect
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
          FLOWMODEL
        </Typography>
        <Typography component="h2" variant="h6" sx={{ mb: 4 }}>
          Авторизация
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Логин"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Пароль"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading || isSubmitting || !username || !password}
          >
            {(loading || isSubmitting) ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
          </Button>

          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="body2" display="inline" sx={{ mr: 1 }}>
              Нет аккаунта?
            </Typography>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <Typography 
                variant="body2" 
                color="primary" 
                display="inline" 
                sx={{ textDecoration: 'underline' }}
              >
                Регистрация
              </Typography>
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 