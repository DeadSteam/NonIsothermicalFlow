import api from './api/api';
import { BackupResponse, DatabaseBackup, RestoreResponse } from '../types/DatabaseBackup';

// Контроллер на бэкенде использует путь /api/admin/database
// baseURL в api.ts содержит 'http://localhost:8080/api'
// поэтому здесь нужен только /admin/database
const API_URL = '/admin/database';

// Преобразование строки имени бэкапа в объект DatabaseBackup
const parseBackupName = (name: string): DatabaseBackup => {
  const backup: DatabaseBackup = { name };
  
  // Пытаемся извлечь дату из имени бэкапа (формат: backup_YYYYMMDD_HHMMSS)
  if (name.startsWith('backup_')) {
    const dateTimeStr = name.substring(7); // Убираем "backup_"
    const parts = dateTimeStr.split('_');
    
    if (parts.length === 2) {
      const dateStr = parts[0]; // YYYYMMDD
      const timeStr = parts[1]; // HHMMSS
      
      if (dateStr.length === 8 && timeStr.length === 6) {
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1; // Месяцы в JS начинаются с 0
        const day = parseInt(dateStr.substring(6, 8));
        
        const hour = parseInt(timeStr.substring(0, 2));
        const minute = parseInt(timeStr.substring(2, 4));
        const second = parseInt(timeStr.substring(4, 6));
        
        backup.createdAt = new Date(year, month, day, hour, minute, second);
      }
    }
  }
  
  return backup;
};

export const getAllBackups = async (): Promise<DatabaseBackup[]> => {
  const response = await api.get<string[]>(`${API_URL}/backups`);
  return response.data.map(parseBackupName);
};

export const createBackup = async (): Promise<BackupResponse> => {
  const response = await api.post<BackupResponse>(`${API_URL}/backup`);
  return response.data;
};

export const restoreFromBackup = async (backupName: string): Promise<RestoreResponse> => {
  const response = await api.post<RestoreResponse>(`${API_URL}/restore/${backupName}`);
  return response.data;
};

export const deleteBackup = async (backupName: string): Promise<RestoreResponse> => {
  const response = await api.delete<RestoreResponse>(`${API_URL}/backup/${backupName}`);
  return response.data;
}; 