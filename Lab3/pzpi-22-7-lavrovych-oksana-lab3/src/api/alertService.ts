import api from './api';

interface UserAlert {
    id: number;
    user_id: number;
    alert_id: number;
    notification_sent: boolean;
}

/** Створити сповіщення для користувача */
export const createUserAlert = async (alertData: any): Promise<UserAlert> => {
    const { data } = await api.post('/api/user-alerts', alertData);
    return data;
};

/** Отримати всі сповіщення для конкретного користувача */
export const getUserAlerts = async (userId: number): Promise<UserAlert[]> => {
    const { data } = await api.get(`/api/user-alerts/${userId}`);
    return data;
};