export type UserRole = 
  | 'Standard' 
  | 'Global Admin' 
  | 'Infrastructure Admin' 
  | 'Security Admin' 
  | 'Business Logic Admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

export interface Threat {
  id: number;
  threat_type: string;
  description: string;
  severity_level: number;
  recommended_action: string;
  created_at: string;
  location_id: number;
}

export interface IoTSensorData {
  id: number;
  temperature: number;
  humidity: number;
  gas_level: number;
  smoke_detected: boolean;
  timestamp: string;
}

// Тип для об'єкта з фізичними параметрами
export interface PhysicalParams {
  avg_temp: number | null;
  min_temp: number | null;
  max_temp: number | null;
  avg_humidity: number | null;
  min_humidity: number | null;
  max_humidity: number | null;
  avg_gas: number | null;
  min_gas: number | null;
  max_gas: number | null;
}

// Тип для повної відповіді від API статистики
export interface Statistics {
  frequencyByType: { threat_type: string; frequency: number }[];
  severityDistribution: { severity_level: number; count: number }[];
  physicalParams: PhysicalParams;
}
/**
 * Тип для даних, що передаються при вході в систему.
 */
export type LoginCredentials = {
  email: string;
  password: string;
};

/**
 * Тип для даних, що передаються при реєстрації нового користувача.
 */
export type RegisterUserData = {
  name: string;
  email: string;
  password: string;
};

// Додаємо нові типи для SystemControlPage
export interface SystemStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
}

export interface LogicSettings {
  weights: {
    temperature: number;
    gas: number;
    smoke: number;
    humidity: number;
  };
  thresholds: {
    fire_temp: number;
    gas_leak_ppm: number;
    overheating_temp: number;
  };
}

export interface AuditLog {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}