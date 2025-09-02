import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../contexts/AuthContext';
import { NOTIFICATIONS } from '../constants';
import { useRouter } from 'next/router';

const getPageTitle = (pathname: string): string => {
    const path = pathname.split('/').pop() || 'dashboard';
    // This is a simplified version, more complex paths might need better logic
    const title = path.replace(/\[.*?\]/g, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    switch(path) {
        case 'order-management': return 'Sale Invoices';
        case 'new-sale-invoice': return 'Create Sale Invoice';
        // Add more specific titles here
        default: return title;
    }
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return null; // Should be handled by _app.tsx
  }

  const title = getPageTitle(router.pathname);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        currentUser={user}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={title} 
          setSidebarOpen={setSidebarOpen} 
          currentUser={user}
          notifications={NOTIFICATIONS}
          onLogout={handleLogout}
        />
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
