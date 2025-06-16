import api from '../api/api'; 
import { User } from '../types'; 

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterUserData = {
  name: string;
  email: string;
  password: string;
};

export const getStoredUser = (): User | null => {
  const userString = localStorage.getItem('user');
  if (!userString) return null;

  try {
    return JSON.parse(userString);
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

/**
 * Функція для входу користувача.
 * @param credentials - Об'єкт з email та паролем.
 * @returns Повертає об'єкт користувача у разі успіху.
 */
export const login = async (credentials: LoginCredentials): Promise<User> => {
  const response = await api.post('/users/login', credentials);
  const { user, token } = response.data;

  if (user && token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  }

  return user;
};

/**
 * Функція для реєстрації нового користувача.
 * @param userData - Дані нового користувача.
 * @returns Повертає об'єкт користувача у разі успіху.
 */
export const register = async (userData: RegisterUserData): Promise<User> => {
  const response = await api.post('/users/register', userData);
  const { user, token } = response.data;

  if (user && token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  }

  return user;
};

/**
 * Функція для виходу користувача.
 * Просто очищує localStorage. Інтерцептор автоматично перестане
 * додавати токен до майбутніх запитів.
 */
export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  // window.location.href = '/'; 
};