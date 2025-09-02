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
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  return <Login setCurrentPage={(page) => router.push(`/${page}`)} />;
}
