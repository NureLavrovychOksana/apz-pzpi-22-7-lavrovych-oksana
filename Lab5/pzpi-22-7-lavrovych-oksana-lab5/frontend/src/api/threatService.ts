import api from './api';
import { Threat } from '../types';

/** Створити нову загрозу */
export const createThreat = async (threatData: any): Promise<Threat> => {
  const { data } = await api.post('/api/threats', threatData);
  return data;
};

/** Отримати всі загрози */
export const getAllThreats = async (): Promise<Threat[]> => {
  const { data } = await api.get('/api/threats');
  return data;
};

/** Отримати загрозу за ID */
export const getThreatById = async (threatId: number): Promise<Threat> => {
  const { data } = await api.get(`/api/threats/${threatId}`);
  return data;
};

/** Оновити загрозу */
export const updateThreat = async (threatId: number, updateData: any): Promise<Threat> => {
  const { data } = await api.put(`/api/threats/${threatId}`, updateData);
  return data;
};

/** Видалити загрозу */
export const deleteThreat = async (threatId: number): Promise<{ message: string }> => {
  const { data } = await api.delete(`/api/threats/${threatId}`);
  return data;
};

/** Отримати поточні/актуальні загрози */
export const getCurrentThreats = async (): Promise<Threat[]> => {
  const { data } = await api.get('/api/current-threats');
  return data;
};

/** Отримати загрози за ID локації */
export const getThreatsByLocation = async (locationId: number): Promise<Threat[]> => {
  const { data } = await api.get(`/api/locations/${locationId}/threats`);
  return data;
};