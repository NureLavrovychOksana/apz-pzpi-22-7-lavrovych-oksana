import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute'; 

import MainLayout from '../components/layout/MainLayout';

// Public Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

// User Pages
import DashboardPage from '../pages/DashboardPage';
import ThreatsHistoryPage from '../pages/ThreatsHistoryPage';
import StatisticsPage from '../pages/StatisticsPage';
import ProfilePage from '../pages/ProfilePage';

// Admin Pages
import UserManagementPage from '../pages/admin/UserManagementPage';
import SystemControlPage from '../pages/admin/SystemControlPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ======================= */}
      {/*      PUBLIC ROUTES      */}
      {/* ======================= */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ======================= */}
      {/*     PROTECTED ROUTES    */}
      {/* ======================= */}
      <Route element={<MainLayout />}>
        {/* --- Загальні маршрути для всіх авторизованих користувачів --- */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/threats-history" element={<ThreatsHistoryPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        {/* --- Маршрути для адміністраторів --- */}
        
        {/* Global Admin має доступ до керування користувачами */}
        <Route element={<PrivateRoute allowedRoles={['Global Admin']} />}>
          <Route path="/admin/users" element={<UserManagementPage />} />
        </Route>
        
        {/* Інші адміни мають доступ до загальної сторінки керування системою */}
        <Route 
          element={
            <PrivateRoute 
              allowedRoles={[
                'Infrastructure Admin', 
                'Global Admin',
                'Security Admin', 
                'Business Logic Admin'
              ]} 
            />
          }
        >
          <Route path="/admin/system-control" element={<SystemControlPage />} />
        </Route>
      </Route>
    </Routes>
  );
};