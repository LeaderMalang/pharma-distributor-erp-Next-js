import EcommerceOrderDetailComponent from '../components/EcommerceOrderDetail';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { EcommerceOrder } from '../types';
import { fetchEcommerceOrderById } from '../services/api';

const EcommerceOrderDetailPage = () => {
    const router = useRouter();
    const { orderId } = router.query;
    
    const [order, setOrder] = useState<EcommerceOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (router.isReady && orderId) {
            const loadOrder = async () => {
                try {
                    setIsLoading(true);
                    const fetchedOrder = await fetchEcommerceOrderById(orderId as string);
                    setOrder(fetchedOrder);
                    setError(null);
                } catch (err: any) {
                    setError(err.message || 'Failed to load order details.');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            loadOrder();
        }
    }, [router.isReady, orderId]);

    const setCurrentPage = (page: string) => {
        router.push(`/${page}`);
    };

    if (isLoading || !router.isReady) {
        return <div className="flex h-screen items-center justify-center">Loading order details...</div>;
    }

    if (error) {
        return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
    }
    
    if (!order) {
        return <div className="flex h-screen items-center justify-center">Order not found.</div>;
    }


    return <EcommerceOrderDetailComponent order={order} setCurrentPage={setCurrentPage} />;
}

export default EcommerceOrderDetailPage;
