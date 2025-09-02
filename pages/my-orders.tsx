import MyOrdersComponent from '../components/MyOrders';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { Order } from '../types';

const MyOrdersPage = () => {
    const { user } = useAuth();
    const router = useRouter();

    const viewOrderDetails = (order: Order) => {
        router.push(`/order-detail?orderId=${order.id}`);
    };

    if (!user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return <MyOrdersComponent currentUser={user} viewOrderDetails={viewOrderDetails} />;
}

export default MyOrdersPage;
