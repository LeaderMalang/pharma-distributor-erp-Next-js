import PurchaseReturn from '../components/PurchaseReturn';
import { useRouter } from 'next/router';
import { PURCHASE_RETURNS } from '../constants';

const NewPurchaseReturnPage = () => {
    const router = useRouter();
    const { editId } = router.query;
    
    const returnToEdit = editId ? PURCHASE_RETURNS.find(o => o.id === editId) || null : null;
    
    const handleClose = () => router.push('/purchase-returns');

    return <PurchaseReturn returnToEdit={returnToEdit} handleClose={handleClose} />;
}

export default NewPurchaseReturnPage;
