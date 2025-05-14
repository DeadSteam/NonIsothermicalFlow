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
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import BackupIcon from '@mui/icons-material/Backup';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatabaseBackup } from '../../types/DatabaseBackup';
import { 
  getAllBackups, 
  createBackup, 
  restoreFromBackup, 
  deleteBackup 
} from '../../services/databaseService';

const DatabaseBackupPanel: React.FC = () => {
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const fetchBackups = async () => {
    setLoading(true);
    setError(null);
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
      setError('Не удалось получить список резервных копий');
      console.error(err);
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
    setSuccessMessage(null);
    try {
      const response = await createBackup();
      setSuccessMessage(response.message);
      fetchBackups();
    } catch (err) {
      setError('Не удалось создать резервную копию');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreDialog.backup) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await restoreFromBackup(restoreDialog.backup.name);
      setSuccessMessage(response.message);
    } catch (err) {
      setError('Не удалось восстановить из резервной копии');
      console.error(err);
    } finally {
      setLoading(false);
      setRestoreDialog({ open: false, backup: null });
    }
  };

  const handleDeleteBackup = async () => {
    if (!deleteDialog.backup) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await deleteBackup(deleteDialog.backup.name);
      setSuccessMessage(response.message);
      fetchBackups();
    } catch (err) {
      setError('Не удалось удалить резервную копию');
      console.error(err);
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

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
                    Резервные копии не найдены
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