import SaleReturn from '../components/SaleReturn';
import { useRouter } from 'next/router';
import { SALE_RETURNS } from '../constants';

const NewSaleReturnPage = () => {
    const router = useRouter();
    const { editId } = router.query;
    
    const returnToEdit = editId ? SALE_RETURNS.find(o => o.id === editId) || null : null;
    
    const handleClose = () => router.push('/sale-returns');

    return <SaleReturn returnToEdit={returnToEdit} handleClose={handleClose} />;
}

export default NewSaleReturnPage;
