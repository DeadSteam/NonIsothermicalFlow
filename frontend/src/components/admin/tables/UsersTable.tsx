import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { User } from '../../../types/User';
import { userService } from '../../../services/api/api';
import { useAuth } from '../../../context/AuthContext';

interface UserFormData {
  id: string | null;
  username: string;
  password: string;
  role: string;
}

const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    id: null,
    username: '',
    password: '',
    role: '',
  });
  const [isEdit, setIsEdit] = useState(false);
  const { user } = useAuth();

  // Загрузка пользователей
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedUsers = await userService.getAllUsers();
        setUsers(loadedUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки пользователей');
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: null,
      username: '',
      password: '',
      role: '',
    });
    setIsEdit(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (e: any) => {
    setFormData({
      ...formData,
      role: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (isEdit && formData.id) {
        // Обновление существующего пользователя
        const updatedUser = await userService.updateUser(
          formData.id,
          formData.username,
          formData.password || undefined
        );
        
        setUsers(users.map(u => u.id === formData.id ? updatedUser : u));
      } else {
        // Добавление нового пользователя
        // В этом случае нужен бы отдельный API-метод для создания пользователя админом
        // Здесь можно реализовать, когда такой метод будет доступен
        alert('Функция добавления пользователя через админ-панель временно недоступна');
        // TODO: Добавить вызов API для создания пользователя
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении пользователя');
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      id: user.id,
      username: user.username,
      password: '',
      role: user.role,
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      setLoading(true);
      await userService.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении пользователя');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Управление пользователями</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Добавить пользователя
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Логин</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell component="th" scope="row">
                  {user.id}
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(user)}>
                    <EditIcon />
                  </IconButton>
                  {/* Не позволяем удалить самого себя или пользователя с ID=1 (основной админ) */}
                  {user.id !== '1' && user.id !== (user?.id) && (
                    <IconButton color="error" onClick={() => handleDelete(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEdit ? 'Редактировать пользователя' : 'Добавить пользователя'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="username"
            name="username"
            label="Логин"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.username}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            id="password"
            name="password"
            label={isEdit ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-label">Роль</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              value={formData.role}
              label="Роль"
              onChange={handleSelectChange}
            >
              <MenuItem value="ADMIN">Администратор</MenuItem>
              <MenuItem value="USER">Пользователь</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit} disabled={!formData.username || !formData.role || (isEdit ? false : !formData.password)}>
            {isEdit ? 'Обновить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersTable; 