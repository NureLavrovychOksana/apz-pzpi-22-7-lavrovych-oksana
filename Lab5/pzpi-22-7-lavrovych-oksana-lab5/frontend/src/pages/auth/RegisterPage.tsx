import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/authService';

const RegisterPage: React.FC = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Паролі не співпадають.');
      return;
    }
    
    if (formData.password.length < 6) {
        setError('Пароль має містити щонайменше 6 символів.');
        return;
    }

    setLoading(true);
    try {
      const { name, email, password } = formData;
      await register({ name, email, password });
      
      alert('Реєстрація успішна! Тепер ви можете увійти в систему.');
      navigate('/login');

    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка під час реєстрації. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-card">
        <h2>Створення облікового запису</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Ім'я</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ваше повне ім'я"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Електронна пошта</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@nure.ua"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Підтвердження пароля</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Створення акаунту...' : 'Зареєструватися'}
          </button>
        </form>
        <div className="auth-link">
          <p>
            Вже маєте акаунт? <Link to="/login">Увійти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;