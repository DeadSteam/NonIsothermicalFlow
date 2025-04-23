import React, { useState } from 'react';
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
  Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { User } from '../../../context/AuthContext';

// Mock data
const initialUsers: User[] = [
  { id: 1, username: 'admin', role: 'Администратор' },
  { id: 2, username: 'user1', role: 'Исследователь' },
  { id: 3, username: 'user2', role: 'Исследователь' },
];

interface UserFormData {
  id: number | null;
  username: string;
  password: string;
  role: string;
}

const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    id: null,
    username: '',
    password: '',
    role: '',
  });
  const [isEdit, setIsEdit] = useState(false);

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

  const handleSubmit = () => {
    if (isEdit) {
      // Update existing user
      setUsers(
        users.map((user) =>
          user.id === formData.id
            ? { ...user, username: formData.username, role: formData.role }
            : user
        )
      );
    } else {
      // Add new user
      const newUser: User = {
        id: users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,
        username: formData.username,
        role: formData.role,
      };
      setUsers([...users, newUser]);
    }

    handleClose();
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

  const handleDelete = (id: number) => {
    setUsers(users.filter((user) => user.id !== id));
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
                <TableCell>{user.role}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(user.id)}>
                    <DeleteIcon />
                  </IconButton>
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
            label="Пароль"
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
              <MenuItem value="Администратор">Администратор</MenuItem>
              <MenuItem value="Исследователь">Исследователь</MenuItem>
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