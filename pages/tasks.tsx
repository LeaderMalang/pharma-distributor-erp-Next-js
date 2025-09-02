import TasksComponent from '../components/Tasks';
import { useAuth } from '../contexts/AuthContext';

const TasksPage = () => {
    const { user } = useAuth();
    
    if (!user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return <TasksComponent currentUser={user} />;
}

export default TasksPage;
