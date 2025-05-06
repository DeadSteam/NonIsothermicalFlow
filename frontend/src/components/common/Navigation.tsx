import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Моделирование течения материалов
        </Typography>
        <Button color="inherit" component={Link} to="/simulation">
          Моделирование
        </Button>
        <Button color="inherit" component={Link} to="/materials-comparison">
          Сравнение материалов
        </Button>
        <Button color="inherit" component={Link} to="/admin-panel">
          Администрирование
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 