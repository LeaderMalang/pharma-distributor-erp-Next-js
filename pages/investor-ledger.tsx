import InvestorLedgerComponent from '../components/InvestorLedger';
import { useAuth } from '../contexts/AuthContext';

const InvestorLedgerPage = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return <InvestorLedgerComponent currentUser={user} />;
}

export default InvestorLedgerPage;
