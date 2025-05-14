import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import Box from '@mui/material/Box';

// Components
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import SimulationPage from './components/simulation/SimulationPage';
import MaterialsComparison from './components/materials/MaterialsComparison';
import AdminPanel from './components/admin/AdminPanel';
import Navigation from './components/common/Navigation';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './context/AuthContext';

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
            {/* Публичные маршруты */}
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/signup" 
              element={!user ? <SignUp /> : <Navigate to="/" replace />} 
            />
            
            {/* Защищенные маршруты для админа */}
            <Route 
              path="/admin-panel" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/simulation" 
              element={
                <ProtectedRoute>
                  <SimulationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/materials-comparison" 
              element={
                <ProtectedRoute>
                  <MaterialsComparison />
                </ProtectedRoute>
              } 
            />

            <Route path="/" element={<Navigate to="/simulation" />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App; 