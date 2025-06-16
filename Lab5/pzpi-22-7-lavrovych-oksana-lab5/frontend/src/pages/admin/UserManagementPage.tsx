import React, { useState, useEffect } from 'react';
import * as adminService from '../../api/adminService';
import { User } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
// import ConfirmationModal from '../../components/common/ConfirmationModal'; 

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllUsers()
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Помилка завантаження користувачів:", error);
        setLoading(false);
      });
  }, []);

  const handleToggleStatus = async (userId: number) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;


    try {
      await adminService.toggleUserStatus(userId);

      const newStatus = userToUpdate.status === 'active' ? 'inactive' : 'active';
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ));

    } catch (error) {
      console.error("Помилка зміни статусу:", error);
      alert("Не вдалося змінити статус користувача.");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Керування Користувачами</h1>
      <table>
        <thead>
            <tr>
                <th>Ім'я</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Дії</th>
            </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={`status-badge status-${user.status}`}>
                  {user.status === 'active' ? 'Активний' : 'Неактивний'}
                </span>
              </td>
              <td>
                <button className="action-button">Змінити роль</button>
                <button 
                  className={`action-button toggle-status-btn ${user.status === 'active' ? 'deactivate' : 'activate'}`}
                  onClick={() => handleToggleStatus(user.id)}
                >
                  {user.status === 'active' ? 'Деактивувати' : 'Активувати'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementPage;