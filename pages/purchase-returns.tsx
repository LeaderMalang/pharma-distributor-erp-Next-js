import PurchaseReturnListComponent from '../components/PurchaseReturnList';
import { useRouter } from 'next/router';
import { PurchaseReturn, Page } from '../types';

const PurchaseReturnsPage = () => {
    const router = useRouter();

    const handleEditPurchaseReturn = (pr: PurchaseReturn) => {
        router.push(`/new-purchase-return?editId=${pr.id}`);
    };

    const setCurrentPage = (page: Page) => {
        router.push(`/${page}`);
    };

    return <PurchaseReturnListComponent handleEditPurchaseReturn={handleEditPurchaseReturn} setCurrentPage={setCurrentPage} />;
}

export default PurchaseReturnsPage;
