import SaleInvoice from '../components/SaleInvoice';
import { useRouter } from 'next/router';
import { ORDERS } from '../constants';
import { Order } from '../types';
import { useEffect, useState } from 'react';

const NewSaleInvoicePage = () => {
    const router = useRouter();
    const { editId } = router.query;
    const [invoice, setInvoice] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!router.isReady) return;

        let foundInvoice: Order | null = null;
        if (editId) {
            foundInvoice = ORDERS.find(o => o.id === editId) || null;
        } else {
            try {
                const invoiceData = sessionStorage.getItem('invoice-to-create');
                if (invoiceData) {
                    foundInvoice = JSON.parse(invoiceData);
                    sessionStorage.removeItem('invoice-to-create');
                }
            } catch (e) {
                console.error("Failed to parse invoice data from session storage", e);
            }
        }
        setInvoice(foundInvoice);
        setIsLoading(false);
    }, [router.isReady, editId]);
    
    const handleClose = () => router.push('/order-management');

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return <SaleInvoice invoiceToEdit={invoice} handleClose={handleClose} />;
}

export default NewSaleInvoicePage;
