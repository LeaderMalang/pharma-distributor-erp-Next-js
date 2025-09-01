import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../contexts/AuthContext';
import { NOTIFICATIONS } from '../constants';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getPageTitle = () => {
    // In a real app, you might have a more sophisticated way to get titles.
    // For now, we'll derive it from the pathname.
    const path = router.pathname.split('/').pop() || 'dashboard';
    return path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!user) {
    return null; // Or a loading spinner, or redirect logic
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        currentUser={user}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={getPageTitle()} 
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
