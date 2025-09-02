import OrderManagementComponent from '../components/OrderManagement';
import { useRouter } from 'next/router';
import { Order } from '../types';

const OrderManagementPage = () => {
    const router = useRouter();

    const handleEditSaleInvoice = (invoice: Order) => {
        router.push(`/new-sale-invoice?editId=${invoice.id}`);
    };

    const viewOrderDetails = (order: Order) => {
        router.push(`/order-detail?orderId=${order.id}`);
    };

    return <OrderManagementComponent viewOrderDetails={viewOrderDetails} handleEditSaleInvoice={handleEditSaleInvoice} />;
}

export default OrderManagementPage;
