import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as adminService from '../../api/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SystemStatus, LogicSettings, AuditLog } from '../../types';

const SystemControlPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // =======================================================
  // Панель Адміністратора інфраструктури
  // =======================================================
  const InfrastructureAdminPanel = () => {
    const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
    const [backupLoading, setBackupLoading] = useState<boolean>(false);

    useEffect(() => {
      const fetchSystemStatus = async () => {
        try {
          setLoading(true);
          const status = await adminService.getSystemStatus();
          setSystemStatus(status);
        } catch (err) {
          setError('Не вдалося завантажити статус системи');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchSystemStatus();
    }, []);

    const handleBackup = async () => {
      if (window.confirm('Ви впевнені, що хочете створити резервну копію системи?')) {
        try {
          setBackupLoading(true);
          const response = await adminService.createBackup();
          alert(response.message);
        } catch (error) {
          alert('Не вдалося створити резервну копію.');
        } finally {
          setBackupLoading(false);
        }
      }
    };

    const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (window.confirm('Ви впевнені, що хочете відновити систему з цього файлу? Ця дія є незворотною.')) {
        try {
          setLoading(true);
          const formData = new FormData();
          formData.append('backup', file);
          const response = await adminService.restoreFromBackup(formData);
          alert(response.message);
        } catch (error) {
          alert('Не вдалося відновити систему з файлу.');
        } finally {
          setLoading(false);
        }
      }
    };

    return (
      <section className="admin-panel">
        <h2><i className="fas fa-server"></i> Керування інфраструктурою</h2>
        <div className="control-group">
          <h3>Моніторинг працездатності серверів</h3>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <ul className="status-list">
              {systemStatus.map(service => (
                <li key={service.name}>
                  {service.name}: <span className={`status-dot status-${service.status}`}>{service.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="control-group">
          <h3>Резервне копіювання</h3>
          <p>Створення повної резервної копії бази даних та налаштувань.</p>
          <button 
            onClick={handleBackup} 
            className="action-button"
            disabled={backupLoading}
          >
            {backupLoading ? 'Створення...' : 'Створити резервну копію'}
          </button>
        </div>
        <div className="control-group">
          <h3>Відновлення системи</h3>
          <p>Відновлення системи з існуючої резервної копії. Ця дія є незворотною.</p>
          <input 
            type="file" 
            accept=".backup,.zip,.sql" 
            onChange={handleRestore}
            disabled={loading}
          />
          <button 
            className="action-button danger" 
            disabled={loading}
          >
            {loading ? 'Відновлення...' : 'Відновити з файлу'}
          </button>
        </div>
      </section>
    );
  };

  // =======================================================
  // Панель Адміністратора бізнес-логіки
  // =======================================================
  const BusinessLogicAdminPanel = () => {
    const [settings, setSettings] = useState<LogicSettings | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
      const fetchSettings = async () => {
        try {
          setLoading(true);
          const data = await adminService.getLogicSettings();
          setSettings(data);
        } catch (err) {
          setError('Не вдалося завантажити налаштування логіки');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, dataset } = e.target;
      const category = dataset.category as keyof LogicSettings;
      if (category && settings) {
        setSettings({
          ...settings,
          [category]: { 
            ...settings[category], 
            [name]: parseFloat(value) 
          }
        });
      }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!settings) return;

      if (window.confirm('Оновити правила бізнес-логіки?')) {
        try {
          setIsSubmitting(true);
          await adminService.updateLogicSettings(settings);
          alert('Правила успішно оновлено.');
        } catch (error) {
          alert('Не вдалося оновити правила.');
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    if (loading) return <LoadingSpinner />;
    if (!settings) return <div>Не вдалося завантажити налаштування</div>;

    return (
      <section className="admin-panel">
        <h2><i className="fas fa-cogs"></i> Керування бізнес-логікою</h2>
        <form onSubmit={handleSubmit}>
          <div className="control-group">
            <h3>Вагові коефіцієнти загроз</h3>
            <div className="form-grid">
              <label>Температура:</label>
              <input 
                type="number" 
                name="temperature" 
                data-category="weights" 
                value={settings.weights.temperature} 
                onChange={handleChange} 
                step="0.01" 
                min="0"
                max="1"
              />
              <label>Газ:</label>
              <input 
                type="number" 
                name="gas" 
                data-category="weights" 
                value={settings.weights.gas} 
                onChange={handleChange} 
                step="0.01" 
                min="0"
                max="1"
              />
              <label>Дим:</label>
              <input 
                type="number" 
                name="smoke" 
                data-category="weights" 
                value={settings.weights.smoke} 
                onChange={handleChange} 
                step="0.01" 
                min="0"
                max="1"
              />
              <label>Вологість:</label>
              <input 
                type="number" 
                name="humidity" 
                data-category="weights" 
                value={settings.weights.humidity} 
                onChange={handleChange} 
                step="0.01" 
                min="0"
                max="1"
              />
            </div>
          </div>
          <div className="control-group">
            <h3>Порогові значення для класифікації загроз</h3>
            <div className="form-grid">
              <label>"Пожежа" (°C):</label>
              <input 
                type="number" 
                name="fire_temp" 
                data-category="thresholds" 
                value={settings.thresholds.fire_temp} 
                onChange={handleChange} 
                min="0"
              />
              <label>"Витік газу" (ppm):</label>
              <input 
                type="number" 
                name="gas_leak_ppm" 
                data-category="thresholds" 
                value={settings.thresholds.gas_leak_ppm} 
                onChange={handleChange} 
                min="0"
              />
              <label>"Перегрів" (°C):</label>
              <input 
                type="number" 
                name="overheating_temp" 
                data-category="thresholds" 
                value={settings.thresholds.overheating_temp} 
                onChange={handleChange} 
                min="0"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="action-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Збереження...' : 'Зберегти правила'}
          </button>
        </form>
      </section>
    );
  };

  // =======================================================
  // Панель Адміністратора безпеки
  // =======================================================
  const SecurityAdminPanel = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [logsLoading, setLogsLoading] = useState<boolean>(false);
    
    useEffect(() => {
      const fetchAuditLogs = async () => {
        try {
          setLogsLoading(true);
          const data = await adminService.getAuditLogs();
          setLogs(data);
        } catch (err) {
          setError('Не вдалося завантажити журнал аудиту');
          console.error(err);
        } finally {
          setLogsLoading(false);
        }
      };

      fetchAuditLogs();
    }, []);

    return (
      <section className="admin-panel">
        <h2><i className="fas fa-shield-alt"></i> Аудит та безпека</h2>
        <div className="control-group">
          <h3>Журнал аудиту</h3>
          {logsLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="audit-log-table">
              <table>
                <thead>
                  <tr>
                    <th>Час</th>
                    <th>Актор</th>
                    <th>Дія</th>
                    <th>Деталі</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.actor}</td>
                      <td>{log.action}</td>
                      <td>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    );
  };
  
  // =======================================================
  // Головний компонент, що рендерить панелі відповідно до ролі
  // =======================================================
  return (
    <div className="system-control-page">
      <h1>Керування системою</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {(user?.role === 'Infrastructure Admin' || user?.role === 'Global Admin') && <InfrastructureAdminPanel />}
      
      {(user?.role === 'Business Logic Admin' || user?.role === 'Global Admin') && <BusinessLogicAdminPanel />}
      
      {(user?.role === 'Security Admin' || user?.role === 'Global Admin') && <SecurityAdminPanel />}

      {user && !['Infrastructure Admin', 'Business Logic Admin', 'Security Admin', 'Global Admin'].includes(user.role) && (
        <p>У вас немає доступу до цього розділу.</p>
      )}
    </div>
  );
};

export default SystemControlPage;