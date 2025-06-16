import api from './api';

interface Location {
    id: number;
    location_name: string;
    address?: string;
}

/** Створити нову локацію */
export const createLocation = async (locationData: any): Promise<Location> => {
    const { data } = await api.post('/api/locations', locationData);
    return data;
};

/** Отримати всі локації */
export const getAllLocations = async (): Promise<Location[]> => {
    const { data } = await api.get('/api/locations');
    return data;
};