import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const standardLinks = [
    { path: '/', label: 'Панель моніторингу' },
    { path: '/threats-history', label: 'Архів сповіщень' },
    { path: '/statistics', label: 'Аналітика' },
    { path: '/profile', label: 'Мій профіль' },
  ];

  const adminLinks = [
    { path: '/admin/users', label: 'Керування користувачами', roles: ['Global Admin'] },
    { path: '/admin/system-control', label: 'Керування системою', roles: ['Global Admin', 'Infrastructure Admin', 'Security Admin', 'Business Logic Admin'] },
  ];

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {standardLinks.map(link => (
            <li key={link.path}><NavLink to={link.path}>{link.label}</NavLink></li>
          ))}
          
          {user && adminLinks
            .filter(link => link.roles.includes(user.role))
            .map(link => (
              <li key={link.path}><NavLink to={link.path}>{link.label}</NavLink></li>
            ))
          }
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;