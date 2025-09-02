import PurchaseInvoiceListComponent from '../components/PurchaseInvoiceList';
import { useRouter } from 'next/router';
import { PurchaseInvoice, Page } from '../types';

const PurchaseInvoicesPage = () => {
    const router = useRouter();

    const handleEditPurchaseInvoice = (invoice: PurchaseInvoice) => {
        router.push(`/new-purchase-invoice?editId=${invoice.id}`);
    };

    const setCurrentPage = (page: Page) => {
        router.push(`/${page}`);
    };

    return <PurchaseInvoiceListComponent handleEditPurchaseInvoice={handleEditPurchaseInvoice} setCurrentPage={setCurrentPage} />;
}

export default PurchaseInvoicesPage;
