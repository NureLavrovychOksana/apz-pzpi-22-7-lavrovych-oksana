import React, { useState, useEffect } from 'react';
import { getStatistics } from '../api/statsService';
import { Statistics } from '../types';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatisticsPage: React.FC = () => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Потрібно вказати діапазон дат
    getStatistics('2024-01-01', '2024-12-31')
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <p>Не вдалося завантажити статистику.</p>;

  return (
    <div>
      <h1>Аналітика</h1>
      <section>
        <h2>Частота загроз за типом</h2>
        <BarChart width={600} height={300} data={stats.frequencyByType}>
          <XAxis dataKey="threat_type" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="frequency" fill="#8884d8" />
        </BarChart>
      </section>

      <section>
        <h2>Розподіл за рівнем небезпеки</h2>
        <PieChart width={400} height={400}>
          <Pie data={stats.severityDistribution} dataKey="count" nameKey="severity_level" cx="50%" cy="50%" outerRadius={150} fill="#8884d8" label>
            {stats.severityDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </section>
    </div>
  );
};

export default StatisticsPage;