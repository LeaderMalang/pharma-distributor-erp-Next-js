import React from 'react';
import { GetServerSideProps } from 'next';
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import WarehouseAdminDashboard from '../components/WarehouseAdminDashboard';
import DeliveryManagerDashboard from '../components/DeliveryManagerDashboard';
import CustomerDashboard from '../components/CustomerDashboard';
import RecoveryOfficerDashboard from '../components/RecoveryOfficerDashboard';
import InvestorDashboard from '../components/InvestorDashboard';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { Order } from '../types';

// Example of SSR: fetching data on the server.
export const getServerSideProps: GetServerSideProps = async (context) => {
  // In a real app, you would fetch this data from an API or database.
  // For demonstration, we'll just pass a server-rendered timestamp.
  const serverRenderedAt = new Date().toISOString();
  return {
    props: {
      serverRenderedAt
    },
  };
};

interface DashboardPageProps {
  serverRenderedAt: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ serverRenderedAt }) => {
    const { user } = useAuth();
    const router = useRouter();
    
    // In Next.js, navigation is handled by the router.
    // We'll map the old setCurrentPage to router.push
    const navigate = (page: string) => router.push(`/${page}`);

    const viewOrderDetails = (order: Order) => {
        // Example of navigating to a dynamic route
        router.push(`/orders/${order.id}`);
    };

    if (!user) {
        return null; // The _app component will handle redirection
    }

    const renderDashboard = () => {
        switch(user.role) {
          case 'SUPER_ADMIN':
            return <SuperAdminDashboard setCurrentPage={navigate} />;
          case 'WAREHOUSE_ADMIN':
            return <WarehouseAdminDashboard setCurrentPage={navigate} viewOrderDetails={viewOrderDetails} />;
          case 'DELIVERY_MANAGER':
            return <DeliveryManagerDashboard setCurrentPage={navigate} viewOrderDetails={viewOrderDetails} />;
          case 'RECOVERY_OFFICER':
            return <RecoveryOfficerDashboard setCurrentPage={navigate} />;
          case 'INVESTOR':
            return <InvestorDashboard setCurrentPage={navigate} currentUser={user}/>;
          case 'CUSTOMER':
            return <CustomerDashboard setCurrentPage={navigate} currentUser={user} />;
          default:
            return <CustomerDashboard setCurrentPage={navigate} currentUser={user} />;
        }
    };

    return (
        <>
            {renderDashboard()}
            <p className="text-xs text-gray-400 mt-8">Page rendered on server at: {serverRenderedAt}</p>
        </>
    );
};

export default DashboardPage;
