import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flexGrow: 1, padding: '20px' }}>
        <Header toggleSidebar={function (): void {
                  throw new Error('Function not implemented.');
              } } />
        <div style={{ marginTop: '20px' }}>
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default MainLayout;