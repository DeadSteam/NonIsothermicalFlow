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
  IconButton,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { userService } from '../../services/api/api';
import { User } from '../../types/User';

interface UserFormData {
  id: string | null;
  username: string;
  role: string;
  password?: string;
}

const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    id: null,
    username: '',
    role: 'USER',
    password: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err);
      setError('Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: null,
      username: '',
      role: 'USER',
      password: ''
    });
    setIsEdit(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    setFormData({
      ...formData,
      role: e.target.value
    });
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      setError('Пожалуйста, введите имя пользователя');
      return false;
    }

    if (!isEdit && !formData.password) {
      setError('Пожалуйста, введите пароль');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isEdit && formData.id) {
        await userService.updateUser(formData.id, formData.username, formData.password);
      } else {
        await userService.createUser(formData.username, formData.password || '', formData.role);
      }

      await fetchUsers();
      handleClose();
    } catch (err) {
      console.error('Ошибка при сохранении пользователя:', err);
      setError('Ошибка при сохранении пользователя');
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      id: user.id,
      username: user.username,
      role: user.role,
      password: '' // Пароль не загружаем из соображений безопасности
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      await userService.deleteUser(id);
      await fetchUsers();
    } catch (err) {
      console.error('Ошибка при удалении пользователя:', err);
      setError('Ошибка при удалении пользователя');
    }
  };

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Имя пользователя</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(user)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {isEdit ? 'Редактировать пользователя' : 'Добавить пользователя'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Имя пользователя"
            type="text"
            fullWidth
            value={formData.username}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="password"
            label={isEdit ? "Новый пароль (оставьте пустым, чтобы не менять)" : "Пароль"}
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="role-select-label">Роль</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={formData.role}
              label="Роль"
              onChange={handleRoleChange}
            >
              <MenuItem value="USER">Пользователь</MenuItem>
              <MenuItem value="ADMIN">Администратор</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersTable; 