import SaleReturnListComponent from '../components/SaleReturnList';
import { useRouter } from 'next/router';
import { SaleReturn, Page } from '../types';

const SaleReturnsPage = () => {
    const router = useRouter();

    const handleEditSaleReturn = (sr: SaleReturn) => {
        router.push(`/new-sale-return?editId=${sr.id}`);
    };

    const setCurrentPage = (page: Page) => {
        router.push(`/${page}`);
    };

    return <SaleReturnListComponent handleEditSaleReturn={handleEditSaleReturn} setCurrentPage={setCurrentPage} />;
}

export default SaleReturnsPage;
