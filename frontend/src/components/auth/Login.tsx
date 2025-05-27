import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
 * Компонент страницы входа в систему
 */
const Login: React.FC = () => {
  // Состояние формы
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Хуки для навигации и аутентификации
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, loading: authLoading, user } = useAuth();

  // Получаем предыдущий маршрут для редиректа после входа
  const from = location.state?.from?.pathname || '/';

  // Редирект если пользователь уже авторизован
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  /**
   * Обработчик отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация формы
    if (!username.trim()) {
      setFormError('Введите логин');
      return;
    }
    
    if (!password) {
      setFormError('Введите пароль');
      return;
    }
    
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await login(username.trim(), password);
      // После успешного входа перенаправление произойдет через useEffect
    } catch (err) {
      console.error('Ошибка входа:', err);
      setFormError(err instanceof Error ? err.message : 'Произошла ошибка при входе в систему');
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
            Авторизация
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
              error={!!formError && !username}
              helperText={formError && !username ? 'Обязательное поле' : ''}
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
              disabled={isSubmitting || authLoading}
              error={!!formError && !password}
              helperText={formError && !password ? 'Обязательное поле' : ''}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={authLoading || isSubmitting || !username || !password}
            >
              {(authLoading || isSubmitting) ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Войти'
              )}
            </Button>

            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Typography variant="body2" display="inline" sx={{ mr: 1 }}>
                Нет аккаунта?
              </Typography>
              <Link 
                to="/signup" 
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
                  Регистрация
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 