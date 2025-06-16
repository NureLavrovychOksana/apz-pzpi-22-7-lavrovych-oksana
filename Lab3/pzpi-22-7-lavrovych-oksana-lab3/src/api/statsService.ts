import api from './api';
import { Statistics } from '../types';

interface Prediction {
    predictedSeverity: number;
}

/** Отримати статистику за період */
export const getStatistics = async (startDate: string, endDate: string): Promise<Statistics> => {
  const { data } = await api.get('/api/stats', {
    params: { startDate, endDate }
  });
  return data;
};

/** Отримати прогноз рівня загрози */
export const getPrediction = async (k: number): Promise<Prediction> => {
  const { data } = await api.get('/api/predict', {
    params: { k }
  });
  return data;
};