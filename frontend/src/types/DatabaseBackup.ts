export interface DatabaseBackup {
  name: string;
  createdAt?: Date; // Может быть извлечено из имени файла backup_YYYYMMDD_HHMMSS
}

export interface BackupResponse {
  message: string;
  backupName: string;
}

export interface RestoreResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
} 