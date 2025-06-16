import api from './api';
import { IoTSensorData } from '../types';

/** Надіслати нові дані з сенсора для обробки */
export const sendIoTData = async (sensorData: any): Promise<{ message: string }> => {
    const { data } = await api.post('/api/iot-data', sensorData);
    return data;
};

/** Отримати останні дані для моніторингу */
export const getRecentIoTData = async (): Promise<IoTSensorData[]> => {
    const { data } = await api.get('/api/iot-data/recent');
    return data;
};

/** Видалити старі IoT-дані (тільки для Admin) */
export const cleanupOldIoTData = async (beforeDate: string): Promise<{ message: string }> => {
    const { data } = await api.delete('/api/admin/iot-data/cleanup', {
        data: { before_date: beforeDate }
    });
    return data;
};