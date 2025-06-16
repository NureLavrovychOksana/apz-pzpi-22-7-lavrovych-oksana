// src/api/userService.ts

import api from './api';
import { User } from '../types';

/** Отримати всіх користувачів (тільки для Global Admin) */
export const getAllUsers = async (): Promise<User[]> => {
  const { data } = await api.get('/users');
  return data;
};

/** Отримати користувача за ID (тільки для Global Admin) */
export const getUserById = async (userId: number): Promise<User> => {
  const { data } = await api.get(`/users/${userId}`);
  return data;
};

/**
 * Оновлює дані користувача. Використовується як для адмінів,
 * так і для оновлення власного профілю.
 * Відповідає маршруту: PUT /users/{id}
 */
export const updateUser = async (userId: number, updateData: Partial<User>): Promise<User> => {
  const { data } = await api.put(`/users/${userId}`, updateData);
  return data;
};

// --- НОВА ФУНКЦІЯ (псевдонім для updateUser) ---
/**
 * Оновлює дані профілю поточного користувача (ім'я, телефон).
 * Це псевдонім для updateUser для кращої читабельності коду на сторінці профілю.
 */
export const updateUserProfile = async (userId: number, profileData: { name?: string; phone?: string }): Promise<User> => {
  return updateUser(userId, profileData);
};

// --- НОВА ФУНКЦІЯ (для зміни пароля) ---
/**
 * Змінює пароль користувача.
 * Примітка: вимагає відповідного ендпоінту на бекенді, наприклад, PUT /users/change-password
 * @param passwordData - Об'єкт зі старим та новим паролями.
 */
export const changePassword = async (passwordData: { 
  oldPassword: string; 
  newPassword: string 
}): Promise<{ message: string }> => {
  const { data } = await api.put('/users/change-password', passwordData);
  return data;
};

/** Видалити користувача (тільки для Global Admin) */
export const deleteUser = async (userId: number): Promise<{ message: string }> => {
  const { data } = await api.delete(`/users/${userId}`);
  return data;
};

/** Змінити статус користувача (active/inactive) (тільки для Global Admin) */
export const toggleUserStatus = async (userId: number): Promise<{ message: string }> => {
  const { data } = await api.put(`/users/${userId}/status`);
  return data;
};