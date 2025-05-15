import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Alert,
  LinearProgress,
  Stack,
  Tooltip,
  Collapse
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { DatabaseBackup } from '../../types/DatabaseBackup';
import { 
  getAllBackups, 
  createBackup, 
  restoreFromBackup, 
  deleteBackup 
} from '../../services/databaseService';
import axios from 'axios';

const DatabaseBackupPanel: React.FC = () => {
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Диалоги подтверждения
  const [restoreDialog, setRestoreDialog] = useState<{open: boolean, backup: DatabaseBackup | null}>({
    open: false,
    backup: null
  });
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, backup: DatabaseBackup | null}>({
    open: false,
    backup: null
  });

  // Функция для обработки ошибок
  const handleError = (err: any, defaultMessage: string) => {
    console.error(err);
    
    if (axios.isAxiosError(err) && err.response) {
      // Получаем подробную ошибку с сервера, если она есть
      const serverError = err.response.data?.error || err.response.data?.message;
      if (serverError) {
        setError(defaultMessage);
        setErrorDetails(serverError);
        return;
      }
    }
    
    // Если нет подробной ошибки, показываем общее сообщение
    setError(defaultMessage);
    setErrorDetails(err.message);
  };

  const toggleErrorDetails = () => {
    setShowErrorDetails(!showErrorDetails);
  };

  const fetchBackups = async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setShowErrorDetails(false);
    try {
      const data = await getAllBackups();
      // Сортируем по дате создания (если она есть), иначе по имени
      setBackups(data.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return a.name.localeCompare(b.name);
      }));
    } catch (err) {
      handleError(err, 'Не удалось получить список резервных копий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setShowErrorDetails(false);
    setSuccessMessage(null);
    try {
      const response = await createBackup();
      setSuccessMessage(response.message);
      fetchBackups();
    } catch (err) {
      handleError(err, 'Не удалось создать резервную копию');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreDialog.backup) return;
    
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setShowErrorDetails(false);
    setSuccessMessage(null);
    try {
      const response = await restoreFromBackup(restoreDialog.backup.name);
      setSuccessMessage(response.message);
    } catch (err) {
      handleError(err, 'Не удалось восстановить из резервной копии');
    } finally {
      setLoading(false);
      setRestoreDialog({ open: false, backup: null });
    }
  };

  const handleDeleteBackup = async () => {
    if (!deleteDialog.backup) return;
    
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setShowErrorDetails(false);
    setSuccessMessage(null);
    try {
      const response = await deleteBackup(deleteDialog.backup.name);
      setSuccessMessage(response.message);
      fetchBackups();
    } catch (err) {
      handleError(err, 'Не удалось удалить резервную копию');
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, backup: null });
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Неизвестно';
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Управление резервными копиями баз данных</Typography>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBackups}
            disabled={loading}
          >
            Обновить
          </Button>
          <Button 
            variant="contained"
            color="primary"
            startIcon={<BackupIcon />}
            onClick={handleCreateBackup}
            disabled={loading}
          >
            Создать резервную копию
          </Button>
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Box mb={2}>
          <Alert 
            severity="error" 
            action={
              errorDetails && (
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={toggleErrorDetails}
                >
                  {showErrorDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )
            }
          >
            {error}
          </Alert>
          
          {errorDetails && (
            <Collapse in={showErrorDetails}>
              <Paper sx={{ p: 2, mt: 1, backgroundColor: '#fff9f9' }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
                  {errorDetails}
                </Typography>
              </Paper>
            </Collapse>
          )}
        </Box>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя резервной копии</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    {loading ? 'Загрузка...' : 'Резервные копии не найдены'}
                  </TableCell>
                </TableRow>
              ) : (
                backups.map((backup) => (
                  <TableRow key={backup.name}>
                    <TableCell component="th" scope="row">
                      {backup.name}
                    </TableCell>
                    <TableCell>{formatDate(backup.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Восстановить из копии">
                        <IconButton 
                          color="primary"
                          onClick={() => setRestoreDialog({ open: true, backup })}
                          disabled={loading}
                        >
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить копию">
                        <IconButton 
                          color="error"
                          onClick={() => setDeleteDialog({ open: true, backup })}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Диалог подтверждения восстановления */}
      <Dialog
        open={restoreDialog.open}
        onClose={() => setRestoreDialog({ open: false, backup: null })}
      >
        <DialogTitle>Подтвердите восстановление</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите восстановить базы данных из резервной копии <strong>{restoreDialog.backup?.name}</strong>?
            Это действие перезапишет все текущие данные в базах данных!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialog({ open: false, backup: null })}>Отмена</Button>
          <Button onClick={handleRestoreBackup} color="primary" autoFocus>
            Восстановить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, backup: null })}
      >
        <DialogTitle>Подтвердите удаление</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить резервную копию <strong>{deleteDialog.backup?.name}</strong>?
            Это действие нельзя будет отменить!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, backup: null })}>Отмена</Button>
          <Button onClick={handleDeleteBackup} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DatabaseBackupPanel; 