import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => (
  <div>
    <h1>Доступ заборонено</h1>
    <p>У вас немає необхідних прав для перегляду цієї сторінки.</p>
    <Link to="/">Повернутися на головну</Link>
  </div>
);

export default UnauthorizedPage;