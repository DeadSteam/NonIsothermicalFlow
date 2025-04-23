import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const SignUp: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { signup, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!username || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    try {
      await signup(username, password);

      if (role === 'Администратор') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (err) {
      console.error('Registration failed', err);
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
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Пароль"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Подтвердите пароль"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordError('');
            }}
            error={!!passwordError}
            helperText={passwordError}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={!username || !password || !confirmPassword}
          >
            Зарегистрироваться
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
                Войти
              </Typography>
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUp; 