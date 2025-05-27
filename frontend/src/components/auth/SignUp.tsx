import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

/**
 * Компонент страницы регистрации
 */
const SignUp: React.FC = () => {
  // Состояние формы
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Хуки для навигации и аутентификации
  const navigate = useNavigate();
  const { signup, error: authError, loading: authLoading, user } = useAuth();

  // Редирект если пользователь уже авторизован
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  /**
   * Валидация формы регистрации
   */
  const validateForm = (): string | null => {
    if (!username.trim()) {
      return 'Введите логин';
    }
    
    if (username.trim().length < 3) {
      return 'Логин должен содержать не менее 3 символов';
    }
    
    if (!password) {
      return 'Введите пароль';
    }
    
    if (password.length < 6) {
      return 'Пароль должен содержать не менее 6 символов';
    }
    
    if (!confirmPassword) {
      return 'Подтвердите пароль';
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
    
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    
    if (isSubmitting) {
      return;
    }
    
    setFormError(null);
    setIsSubmitting(true);

    try {
      await signup(username.trim(), password);
      navigate('/');
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      setFormError(err instanceof Error ? err.message : 'Произошла ошибка при регистрации');
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
            p: 4, 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
            FLOWMODEL
          </Typography>
          <Typography component="h2" variant="h6" sx={{ mb: 4 }}>
            Регистрация
          </Typography>

          {(formError || authError) && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {formError || authError}
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
              disabled={isSubmitting || authLoading}
              error={!!formError && !username.trim()}
              helperText={formError && !username.trim() ? 'Обязательное поле' : ''}
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
              disabled={isSubmitting || authLoading}
              error={!!formError && !password}
              helperText={formError && !password ? 'Обязательное поле' : ''}
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
              disabled={isSubmitting || authLoading}
              error={!!formError && !confirmPassword}
              helperText={formError && !confirmPassword ? 'Обязательное поле' : ''}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={authLoading || isSubmitting || !username || !password || !confirmPassword}
            >
              {(authLoading || isSubmitting) ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Зарегистрироваться'
              )}
            </Button>

            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Typography variant="body2" display="inline" sx={{ mr: 1 }}>
                Уже есть аккаунт?
              </Typography>
              <Link 
                to="/login" 
                style={{ 
                  textDecoration: 'none',
                  pointerEvents: isSubmitting || authLoading ? 'none' : 'auto'
                }}
              >
                <Typography 
                  variant="body2" 
                  color="primary" 
                  display="inline" 
                  sx={{ 
                    textDecoration: 'underline',
                    opacity: isSubmitting || authLoading ? 0.5 : 1
                  }}
                >
                  Вход
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignUp; 