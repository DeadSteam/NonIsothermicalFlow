import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './context/AuthContext';
import { Container } from '@mui/material';
import Box from '@mui/material/Box';

// Components
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import SimulationPage from './components/simulation/SimulationPage';
import MaterialsComparison from './components/materials/MaterialsComparison';
import AdminPanel from './components/admin/AdminPanel';
import Navigation from './components/common/Navigation';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3a7ebf',
      dark: '#2d5f8f',
    },
    secondary: {
      main: '#1C414D',
    },
    background: {
      default: '#f0f0f0',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '10px 20px',
          fontSize: '1rem',
          fontWeight: 600,
        },
      },
    },
  },
});

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navigation />
        <Container sx={{ mt: 3 }}>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : (user.role === 'Администратор' ? <Navigate to="/admin" /> : <Navigate to="/user" />)} />
            <Route path="/signup" element={!user ? <SignUp /> : (user.role === 'Администратор' ? <Navigate to="/admin" /> : <Navigate to="/user" />)} />
            <Route path="/admin" element={/*user && user.role === 'Администратор' ?*/ <AdminDashboard /> /*: <Navigate to="/login" />*/} />
            <Route path="/user" element={/*user && user.role === 'Исследователь' ?*/ <UserDashboard /> /*: <Navigate to="/login" />*/} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/materials-comparison" element={<MaterialsComparison />} />
            <Route path="/" element={<Navigate to="/simulation" />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App; 