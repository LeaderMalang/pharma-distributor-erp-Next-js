import CreditRecoveryComponent from '../components/CreditRecovery';
import { useAuth } from '../contexts/AuthContext';

const CreditRecoveryPage = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return <CreditRecoveryComponent currentUser={user} />;
}

export default CreditRecoveryPage;
