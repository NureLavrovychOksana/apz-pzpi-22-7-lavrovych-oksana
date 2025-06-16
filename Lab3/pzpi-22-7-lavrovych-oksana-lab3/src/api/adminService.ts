import api from './api';
import { User, UserRole, SystemStatus, LogicSettings, AuditLog } from '../types';

// =======================================================
// Функції для GLOBAL ADMIN (на основі наданих маршрутів)
// =======================================================

/**
 * Отримує список всіх користувачів.
 * Відповідає маршруту: GET /users
 * Доступно для: Global Admin.
 */
export const getAllUsers = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>('/users');
  return data;
};

/**
 * Змінює статус користувача (active/inactive).
 * Відповідає маршруту: PUT /users/{id}/status
 * Доступно для: Global Admin.
 * @param userId - ID користувача.
 */
export const toggleUserStatus = async (userId: number): Promise<{ message: string }> => {
  const { data } = await api.put(`/users/${userId}/status`);
  return data;
};

/**
 * Видаляє користувача з системи.
 * Відповідає маршруту: DELETE /users/{id}
 * Доступно для: Global Admin.
 * @param userId - ID користувача.
 */
export const deleteUser = async (userId: number): Promise<{ message: string }> => {
    const { data } = await api.delete(`/users/${userId}`);
    return data;
};

// =================================================================
// Функції для Infrastructure Admin
// =================================================================

/**
 * Отримує статус системних сервісів
 * Відповідає маршруту: GET /admin/system-status
 */
export const getSystemStatus = async (): Promise<SystemStatus[]> => {
  const { data } = await api.get<SystemStatus[]>('/admin/system-status');
  return data;
};

/**
 * Створює резервну копію системи
 * Відповідає маршруту: POST /admin/backup
 */
export const createBackup = async (): Promise<{ message: string }> => {
  const { data } = await api.post('/admin/backup');
  return data;
};

/**
 * Відновлює систему з резервної копії
 * Відповідає маршруту: POST /admin/restore
 */
export const restoreFromBackup = async (backupFile: FormData): Promise<{ message: string }> => {
  const { data } = await api.post('/admin/restore', backupFile, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

// =================================================================
// Функції для Business Logic Admin
// =================================================================

/**
 * Отримує поточні налаштування бізнес-логіки
 * Відповідає маршруту: GET /admin/logic-settings
 */
export const getLogicSettings = async (): Promise<LogicSettings> => {
  const { data } = await api.get<LogicSettings>('/admin/logic-settings');
  return data;
};

/**
 * Оновлює налаштування бізнес-логіки
 * Відповідає маршруту: PUT /admin/logic-settings
 */
export const updateLogicSettings = async (settings: LogicSettings): Promise<{ message: string }> => {
  const { data } = await api.put('/admin/logic-settings', settings);
  return data;
};

// =================================================================
// Функції для Security Admin
// =================================================================

/**
 * Отримує журнал аудиту системи
 * Відповідає маршруту: GET /admin/audit-logs
 */
export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const { data } = await api.get<AuditLog[]>('/admin/audit-logs');
  return data;
};

/**
 * Очищає журнал аудиту
 * Відповідає маршруту: DELETE /admin/audit-logs
 */
export const clearAuditLogs = async (): Promise<{ message: string }> => {
  const { data } = await api.delete('/admin/audit-logs');
  return data;
};