import OrderDetailComponent from '../components/OrderDetail';
import { useRouter } from 'next/router';
import { ORDERS } from '../constants';

const OrderDetailPage = () => {
    const router = useRouter();
    const { orderId } = router.query;
    
    const order = ORDERS.find(o => o.id === orderId);

    if (!router.isReady || !order) {
        return <div className="flex h-screen items-center justify-center">Order not found or loading...</div>;
    }

    const setCurrentPage = (page: string) => {
        router.push(`/${page}`);
    };

    return <OrderDetailComponent order={order} setCurrentPage={setCurrentPage} />;
}

export default OrderDetailPage;
