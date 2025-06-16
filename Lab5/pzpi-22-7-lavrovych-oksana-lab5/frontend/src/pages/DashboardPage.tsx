// src/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { getRecentIoTData } from '../api/iotService'; 
import { getCurrentThreats } from '../api/threatService'; 
import { IoTSensorData, Threat } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const [sensorData, setSensorData] = useState<IoTSensorData | null>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      try {
        const [iotResult, threatsResult] = await Promise.all([
          getRecentIoTData(),
          getCurrentThreats() 
        ]);
        if (iotResult && iotResult.length > 0) {
          setSensorData(iotResult[0]);
        } else {
          setSensorData(null); 
        }

        setThreats(threatsResult.slice(0, 5));
        
      } catch (error) {
        console.error("Помилка завантаження даних для панелі:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); 
    const intervalId = setInterval(fetchData, 15000); 

    return () => clearInterval(intervalId); 
  }, []);

  if (loading && !sensorData) { 
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1>Панель моніторингу</h1>
      <section className="sensor-data">
        <h2>Актуальні показники</h2>
        {sensorData ? (
          <ul>
            <li>Температура: {sensorData.temperature.toFixed(1)}°C</li>
            <li>Вологість: {sensorData.humidity.toFixed(1)}%</li>
            <li>Рівень газу: {sensorData.gas_level} ppm</li>
            <li>Дим: {sensorData.smoke_detected ? 'Виявлено' : 'Відсутній'}</li>
            <li><small>Оновлено: {new Date(sensorData.timestamp).toLocaleString()}</small></li>
          </ul>
        ) : <p>Дані з сенсорів тимчасово недоступні.</p>}
      </section>
      
      <section className="recent-threats">
        <h2>Останні загрози</h2>
        {threats.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Тип загрози</th>
                <th>Рівень небезпеки</th>
                <th>Час виявлення</th>
              </tr>
            </thead>
            <tbody>
              {threats.map(threat => (
                <tr key={threat.id}>
                  <td>{threat.threat_type}</td>
                  <td>{threat.severity_level}</td>
                  <td>{new Date(threat.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>За останній час активних загроз не виявлено.</p>}
      </section>
    </div>
  );
};

export default DashboardPage;