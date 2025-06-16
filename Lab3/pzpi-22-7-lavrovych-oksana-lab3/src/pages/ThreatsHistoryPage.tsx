import React, { useState, useEffect, useMemo } from 'react';
import { getAllThreats } from '../api/threatService';
import { Threat } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

type SortConfig = {
  key: keyof Threat;
  direction: 'ascending' | 'descending';
};

const ThreatsHistoryPage: React.FC = () => {
  const [allThreats, setAllThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: 'all',
  });
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: 'created_at',
    direction: 'descending',
  });

  useEffect(() => {
    getAllThreats()
      .then(data => {
        setAllThreats(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Помилка завантаження архіву загроз:", error);
        setLoading(false);
      });
  }, []);

  const threatTypes = useMemo(() => {
    const types = new Set(allThreats.map(threat => threat.threat_type));
    return Array.from(types);
  }, [allThreats]);

  const filteredAndSortedThreats = useMemo(() => {
    let filtered = [...allThreats];

    if (filters.type !== 'all') {
      filtered = filtered.filter(threat => threat.threat_type === filters.type);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(threat => new Date(threat.created_at) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(threat => new Date(threat.created_at) <= new Date(filters.dateTo));
    }

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [allThreats, filters, sortConfig]);

  const requestSort = (key: keyof Threat) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="threats-history-page">
      <h1>Архів сповіщень</h1>
      <div className="filters-container">
        <div className="filter-group">
            <label htmlFor="dateFrom">Дата від:</label>
            <input type="date" id="dateFrom" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
        </div>
        <div className="filter-group">
            <label htmlFor="dateTo">Дата до:</label>
            <input type="date" id="dateTo" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
        </div>
        <div className="filter-group">
            <label htmlFor="type">Тип загрози:</label>
            <select id="type" name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="all">Всі типи</option>
              {threatTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
        </div>
      </div>
      
      <div className="threats-table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('threat_type')}>Тип загрози</th>
              <th onClick={() => requestSort('severity_level')}>Рівень небезпеки</th>
              <th>Опис</th>
              <th onClick={() => requestSort('created_at')}>Час виявлення</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedThreats.length > 0 ? (
              filteredAndSortedThreats.map(threat => (
                <tr key={threat.id}>
                  <td>{threat.threat_type}</td>
                  <td className={`severity-${threat.severity_level}`}>{threat.severity_level}</td>
                  <td>{threat.description}</td>
                  <td>{new Date(threat.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>За обраними фільтрами загроз не знайдено.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ThreatsHistoryPage;