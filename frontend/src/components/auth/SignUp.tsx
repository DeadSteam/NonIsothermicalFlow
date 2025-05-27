import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const SignUp: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { signup, error, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация формы
    if (!username || !password || !confirmPassword) {
      setFormError('Пожалуйста, заполните все поля');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Пароли не совпадают');
      return;
    }
    
    if (username.length < 3) {
      setFormError('Логин должен содержать не менее 3 символов');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Пароль должен содержать не менее 6 символов');
      return;
    }
    
    setFormError(null);
    setIsSubmitting(true);

    try {
      await signup(username, password);
      navigate('/');
    } catch (err) {
      console.error('Registration failed', err);
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
          Регистрация
        </Typography>

        {(formError || error) && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {formError || error}
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
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading || isSubmitting || !username || !password || !confirmPassword}
          >
            {(loading || isSubmitting) ? <CircularProgress size={24} color="inherit" /> : 'Зарегистрироваться'}
          </Button>

          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="body2" display="inline" sx={{ mr: 1 }}>
              Уже есть аккаунт?
            </Typography>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography 
                variant="body2" 
                color="primary" 
                display="inline" 
                sx={{ textDecoration: 'underline' }}
              >
                Вход
              </Typography>
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUp; 