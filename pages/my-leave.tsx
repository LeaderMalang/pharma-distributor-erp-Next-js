import MyLeaveComponent from '../components/MyLeave';
import { useAuth } from '../contexts/AuthContext';

const MyLeavePage = () => {
    const { user } = useAuth();
    
    if (!user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return <MyLeaveComponent currentUser={user} />;
}

export default MyLeavePage;
