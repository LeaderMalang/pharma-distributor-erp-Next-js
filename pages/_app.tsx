
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function AppContent({ Component, pageProps }: AppProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isPublicPage = ['/'].includes(router.pathname); // or /login, /register

  useEffect(() => {
    if (!isLoading && !user && !isPublicPage) {
      router.push('/');
    }
  }, [isLoading, user, isPublicPage, router]);

  if (isLoading) {
    return <div>Loading...</div>; // Replace with a proper loading spinner/component
  }

  if (!user && !isPublicPage) {
     return <div>Redirecting...</div>; // Or a loading spinner
  }

  if (!user && isPublicPage) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}


export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}
