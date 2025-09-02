import LedgerComponent from '../components/Ledger';
import { useAuth } from '../contexts/AuthContext';

const LedgerPage = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return <LedgerComponent currentUser={user} />;
}

export default LedgerPage;
