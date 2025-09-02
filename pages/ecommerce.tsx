import EcommerceOrdersComponent from '../components/EcommerceOrders';
import { useRouter } from 'next/router';
import { Order, EcommerceOrder, Page } from '../types';

const EcommerceOrdersPage = () => {
    const router = useRouter();

    const handleEditSaleInvoice = (invoice: Order) => {
        sessionStorage.setItem('invoice-to-create', JSON.stringify(invoice));
        router.push(`/new-sale-invoice`);
    };

    const viewOrderDetails = (order: EcommerceOrder) => {
        router.push(`/ecommerce-order-detail?orderId=${order.id}`);
    };
    
    const setCurrentPage = (page: Page) => {
        router.push(`/${page}`);
    };

    return <EcommerceOrdersComponent 
        setCurrentPage={setCurrentPage}
        handleEditSaleInvoice={handleEditSaleInvoice} 
        viewOrderDetails={viewOrderDetails} 
    />;
}

export default EcommerceOrdersPage;
