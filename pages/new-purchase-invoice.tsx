import PurchaseInvoice from '../components/PurchaseInvoice';
import { useRouter } from 'next/router';
import { PURCHASE_INVOICES } from '../constants';

const NewPurchaseInvoicePage = () => {
    const router = useRouter();
    const { editId } = router.query;
    
    const invoiceToEdit = editId ? PURCHASE_INVOICES.find(o => o.id === editId) || null : null;
    
    const handleClose = () => router.push('/purchase-invoices');

    return <PurchaseInvoice invoiceToEdit={invoiceToEdit} handleClose={handleClose} />;
}

export default NewPurchaseInvoicePage;
