import React from 'react';
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import WarehouseAdminDashboard from '../components/WarehouseAdminDashboard';
import DeliveryManagerDashboard from '../components/DeliveryManagerDashboard';
import CustomerDashboard from '../components/CustomerDashboard';
import RecoveryOfficerDashboard from '../components/RecoveryOfficerDashboard';
import InvestorDashboard from '../components/InvestorDashboard';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { Order, EcommerceOrder } from '../types';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();
    
    const navigate = (page: string) => router.push(`/${page}`);

    const viewOrderDetails = (order: Order) => {
        // In a real app with dynamic routing, you'd pass an ID
        // For now, we pass it in query params for simplicity
        router.push(`/order-detail?orderId=${order.id}`);
    };

    const viewEcommerceOrderDetails = (order: EcommerceOrder) => {
        router.push(`/ecommerce-order-detail?orderId=${order.id}`);
    };

    if (!user) {
        return null; // The _app component will handle redirection
    }

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

export default DashboardPage;
