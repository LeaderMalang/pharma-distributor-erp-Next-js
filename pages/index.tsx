import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Login from '../components/Login';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return <div>Loading...</div>; // Or a splash screen
  }
  
  return <Login />;
}
