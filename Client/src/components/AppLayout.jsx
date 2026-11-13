import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export const AppLayout = ({ breadcrumbs = [], children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="app-main">
        <TopBar breadcrumbs={breadcrumbs} />
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
