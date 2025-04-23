import React, { useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UsersTable from './tables/UsersTable';
import MaterialsTable from './tables/MaterialsTable';
import MathModelTable from './tables/MathModelTable';
import ProcessParamsTable from './tables/ProcessParamsTable';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const drawerWidth = 240;

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTable, setActiveTable] = useState<string>('users');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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

  const handleBackupDatabase = () => {
    handleMenuClose();
    alert('Резервная копия базы данных создана');
  };

  const handleRestoreDatabase = () => {
    handleMenuClose();
    alert('База данных восстановлена');
  };

  const renderTable = () => {
    switch (activeTable) {
      case 'users':
        return <UsersTable />;
      case 'materials':
        return <MaterialsTable />;
      case 'mathmodel':
        return <MathModelTable />;
      case 'processparams':
        return <ProcessParamsTable />;
      default:
        return <UsersTable />;
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          FLOWMODEL
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={activeTable === 'users'}
            onClick={() => {
              setActiveTable('users');
              setMobileOpen(false);
            }}
          >
            <ListItemText primary="Пользователи" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            selected={activeTable === 'materials'}
            onClick={() => {
              setActiveTable('materials');
              setMobileOpen(false);
            }}
          >
            <ListItemText primary="Материалы" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            selected={activeTable === 'mathmodel'}
            onClick={() => {
              setActiveTable('mathmodel');
              setMobileOpen(false);
            }}
          >
            <ListItemText primary="Математическая модель" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            selected={activeTable === 'processparams'}
            onClick={() => {
              setActiveTable('processparams');
              setMobileOpen(false);
            }}
          >
            <ListItemText primary="Параметры процесса" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Окно администратора
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
              <MenuItem onClick={handleBackupDatabase}>Создать резервную копию</MenuItem>
              <MenuItem onClick={handleRestoreDatabase}>Восстановить базу данных</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Выход</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px'
        }}
      >
        <Container>
          {renderTable()}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 