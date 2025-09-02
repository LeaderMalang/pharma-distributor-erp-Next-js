import EcommerceOrderDetailComponent from '../components/EcommerceOrderDetail';
import { useRouter } from 'next/router';
import { ECOMMERCE_ORDERS } from '../constants';

const EcommerceOrderDetailPage = () => {
    const router = useRouter();
    const { orderId } = router.query;
    
    const order = ECOMMERCE_ORDERS.find(o => o.id === orderId);

    if (!router.isReady || !order) {
        return <div className="flex h-screen items-center justify-center">Order not found or loading...</div>;
    }

    const setCurrentPage = (page: string) => {
        router.push(`/${page}`);
    };

    return <EcommerceOrderDetailComponent order={order} setCurrentPage={setCurrentPage} />;
}

export default EcommerceOrderDetailPage;
