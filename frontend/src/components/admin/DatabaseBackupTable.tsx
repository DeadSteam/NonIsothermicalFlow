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
  Typography,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import BackupIcon from '@mui/icons-material/Backup';
import WarningIcon from '@mui/icons-material/Warning';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api/api';

interface Backup {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  database: string;
}

const DatabaseBackupTable: React.FC = () => {
  const { user } = useAuth();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState<boolean>(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [creatingBackup, setCreatingBackup] = useState<boolean>(false);
  const [restoringBackup, setRestoringBackup] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deletingBackup, setDeletingBackup] = useState<boolean>(false);

  const fetchBackups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/backups');
      setBackups(response.data);
    } catch (err) {
      setError('Ошибка при загрузке резервных копий базы данных');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchBackups();
    } else {
      setError('Доступ запрещен. Требуется роль администратора.');
      setLoading(false);
    }
  }, [user]);

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/admin/backups');
      setSuccess('Резервная копия успешно создана');
      fetchBackups();
    } catch (err) {
      setError('Ошибка при создании резервной копии');
      console.error(err);
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleOpenRestoreDialog = (backup: Backup) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
  };

  const handleCloseRestoreDialog = () => {
    setRestoreDialogOpen(false);
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    
    setRestoringBackup(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post(`/admin/backups/${selectedBackup.id}/restore`);
      setSuccess(`База данных успешно восстановлена из резервной копии: ${selectedBackup.filename}`);
      handleCloseRestoreDialog();
    } catch (err) {
      setError('Ошибка при восстановлении базы данных');
      console.error(err);
    } finally {
      setRestoringBackup(false);
    }
  };

  const handleOpenDeleteDialog = (backup: Backup) => {
    setSelectedBackup(backup);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteBackup = async () => {
    if (!selectedBackup) return;
    
    setDeletingBackup(true);
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/admin/backups/${selectedBackup.id}`);
      setSuccess(`Резервная копия успешно удалена: ${selectedBackup.filename}`);
      handleCloseDeleteDialog();
      fetchBackups(); // Обновляем список бэкапов
    } catch (err) {
      setError('Ошибка при удалении резервной копии');
      console.error(err);
    } finally {
      setDeletingBackup(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' КБ';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' МБ';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' ГБ';
  };

  const formatDate = (dateValue: any): string => {
    try {
      // Если dateValue - это массив [год, месяц, день, час, минута, секунда]
      if (Array.isArray(dateValue) && dateValue.length >= 6) {
        const [year, monthIndex, day, hour, minute, second] = dateValue;
        // Создаем объект Date (обратите внимание, что в JavaScript месяцы начинаются с 0)
        const date = new Date(year, monthIndex - 1, day, hour, minute, second);
        
        // Проверяем валидность даты
        if (isNaN(date.getTime())) {
          console.warn('Невалидная дата из массива:', dateValue);
          return 'Некорректная дата';
        }
        
        return new Intl.DateTimeFormat('ru', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(date);
      }
      
      // Если dateValue - строка
      if (typeof dateValue === 'string' && dateValue) {
        // Проверяем, если строка содержит форматированную дату из Java LocalDateTime
        if (dateValue.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
          // Преобразуем ISO-строку в объект Date
          const date = new Date(dateValue);
          
          // Проверяем валидность даты
          if (isNaN(date.getTime())) {
            console.warn('Невалидная дата из строки:', dateValue);
            return 'Некорректная дата';
          }
          
          return new Intl.DateTimeFormat('ru', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).format(date);
        } else {
          // Если формат строки не соответствует ожидаемому
          console.warn('Неожиданный формат даты (строка):', dateValue);
          return dateValue || 'Нет данных';
        }
      }
      
      // Если это объект Date
      if (dateValue instanceof Date) {
        return new Intl.DateTimeFormat('ru', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(dateValue);
      }
      
      // Если тип данных не поддерживается
      console.warn('Неожиданный тип данных для даты:', typeof dateValue, dateValue);
      return String(dateValue) || 'Нет данных';
    } catch (error) {
      console.error('Ошибка при форматировании даты:', error, dateValue);
      return 'Ошибка форматирования';
    }
  };

  // Если нет прав доступа, показываем сообщение
  if (user && user.role !== 'ADMIN') {
    return (
      <Alert severity="error">
        У вас нет доступа к этому разделу. Требуется роль администратора.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div">
          Управление резервными копиями базы данных
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<BackupIcon />} 
          onClick={handleCreateBackup}
          disabled={creatingBackup}
        >
          {creatingBackup ? 'Создание...' : 'Создать резервную копию'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : backups.length === 0 ? (
        <Alert severity="info">
          Резервные копии не найдены. Создайте первую резервную копию.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя файла</TableCell>
                <TableCell>База данных</TableCell>
                <TableCell>Размер</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>{backup.filename}</TableCell>
                  <TableCell>
                    <Chip 
                      label={backup.database}
                      color={backup.database === 'materials_db' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatFileSize(backup.size)}</TableCell>
                  <TableCell>{formatDate(backup.createdAt)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleOpenDeleteDialog(backup)}
                        sx={{ mr: 1 }}
                      >
                        Удалить
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        startIcon={<RestoreIcon />}
                        onClick={() => handleOpenRestoreDialog(backup)}
                      >
                        Восстановить
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={restoreDialogOpen}
        onClose={handleCloseRestoreDialog}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            Подтверждение восстановления
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите восстановить базу данных из резервной копии: <strong>{selectedBackup?.filename}</strong>? 
            Этот процесс перезапишет все текущие данные и не может быть отменен.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRestoreDialog}>Отмена</Button>
          <Button 
            onClick={handleRestoreBackup} 
            color="warning" 
            variant="contained"
            disabled={restoringBackup}
          >
            {restoringBackup ? 'Восстановление...' : 'Восстановить'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="error" sx={{ mr: 1 }} />
            Подтверждение удаления
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить резервную копию: <strong>{selectedBackup?.filename}</strong>? 
            Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
          <Button 
            onClick={handleDeleteBackup} 
            color="error" 
            variant="contained"
            disabled={deletingBackup}
          >
            {deletingBackup ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DatabaseBackupTable; 