import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, 
  Paper,
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  Alert,
  Box
} from '@mui/material';

/**
 * Компонент страницы регистрации
 */
const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, user, loading, error } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Редирект если пользователь уже авторизован
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);
    
  /**
   * Валидация формы регистрации
   */
  const validateForm = (): string | null => {
    if (!username.trim()) {
      return 'Введите имя пользователя';
    }
    if (password.length < 6) {
      return 'Пароль должен содержать минимум 6 символов';
    }
    if (password !== confirmPassword) {
      return 'Пароли не совпадают';
    }
    return null;
  };

  /**
   * Обработчик отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setLocalError(null);
      await signup(username.trim(), password);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Произошла ошибка при регистрации');
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
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
          Регистрация
        </Typography>

          {(error || localError) && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error || localError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
              label="Имя пользователя"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Подтвердите пароль"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting || loading}
          >
              {(isSubmitting || loading) ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Зарегистрироваться'
              )}
          </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignUp; 