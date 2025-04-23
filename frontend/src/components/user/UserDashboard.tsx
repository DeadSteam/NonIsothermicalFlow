import React, { useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Tabs,
  Tab,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Menu,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const UserDashboard: React.FC = () => {
  const {user, logout } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [material, setMaterial] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FLOWMODEL - Исследователь
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {user?.username}
            </Typography>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleMenuOpen}
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>Выход</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          centered
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ bgcolor: 'primary.main' }}
        >
          <Tab label="Исследование" />
          <Tab label="Результаты" />
        </Tabs>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Параметры исследования
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Ширина канала"
                    type="number"
                    InputProps={{ inputProps: { min: 0 } }}
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    label="Глубина канала"
                    type="number"
                    InputProps={{ inputProps: { min: 0 } }}
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    label="Длина канала"
                    type="number"
                    InputProps={{ inputProps: { min: 0 } }}
                    sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Скорость движения крышки"
                  type="number"
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Температура крышки"
                  type="number"
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    label="Шаг расчета"
                    type="number"
                    InputProps={{ inputProps: { min: 0 } }}
                    sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box 
                  sx={{ 
                    height: 200, 
                    bgcolor: 'background.default', 
                    border: '1px dashed grey',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <Typography color="text.secondary">
                    Здесь будет отображаться график
                  </Typography>
                </Box>

                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 2 }}
                >
                  Запустить расчет
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Результаты исследований
            </Typography>
            <Box 
              sx={{ 
                height: 300, 
                bgcolor: 'background.default', 
                border: '1px dashed grey',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography color="text.secondary">
                Здесь будет таблица с результатами
              </Typography>
            </Box>

            <Button 
              variant="contained" 
              sx={{ mt: 2, mr: 2 }}
            >
              Экспорт в Excel
            </Button>

            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
            >
              Очистить историю
            </Button>
          </Paper>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default UserDashboard; 