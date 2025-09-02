import EcommerceOrdersComponent from '../components/EcommerceOrders';
import { useRouter } from 'next/router';
import { Order, EcommerceOrder, Page, EcommerceOrderStatus } from '../types';
import { useEffect, useState } from 'react';
import { fetchEcommerceOrders, updateEcommerceOrderStatus } from '../services/api';

const EcommerceOrdersPage = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<EcommerceOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [totalOrders, setTotalOrders] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setIsLoading(true);
                const offset = (currentPage - 1) * rowsPerPage;
                const { count, orders: fetchedOrders } = await fetchEcommerceOrders(rowsPerPage, offset);
                setOrders(fetchedOrders);
                setTotalOrders(count);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load orders.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadOrders();
    }, [currentPage]);

    const handleEditSaleInvoice = (invoice: Order) => {
        sessionStorage.setItem('invoice-to-create', JSON.stringify(invoice));
        router.push(`/new-sale-invoice`);
    };

    const viewOrderDetails = (order: EcommerceOrder) => {
        router.push(`/ecommerce-order-detail?orderId=${order.id}`);
    };
    
    const navigateToPage = (page: Page) => {
        router.push(`/${page}`);
    };

    const handleStatusChange = async (orderId: string, newStatus: EcommerceOrderStatus) => {
        const originalOrders = [...orders];
        try {
            // Optimistic update
            const updatedOrders = orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            );
            setOrders(updatedOrders);

            // API call
            const updatedOrderFromServer = await updateEcommerceOrderStatus(orderId, newStatus);
            
            // Final state update with server data
            setOrders(prevOrders => prevOrders.map(order =>
                order.id === updatedOrderFromServer.id ? updatedOrderFromServer : order
            ));
        } catch (error: any) {
            console.error('Failed to update status:', error);
            setOrders(originalOrders);
            alert(`Error: ${error.message}`);
        }
    };

    if (isLoading && orders.length === 0) {
        return <div className="flex h-screen items-center justify-center">Loading Ecommerce Orders...</div>;
    }

    if (error) {
        return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
    }

    return <EcommerceOrdersComponent 
        orders={orders}
        setCurrentPage={navigateToPage}
        handleEditSaleInvoice={handleEditSaleInvoice} 
        viewOrderDetails={viewOrderDetails}
        onStatusChange={handleStatusChange}
        totalOrders={totalOrders}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
    />;
}

export default EcommerceOrdersPage;
