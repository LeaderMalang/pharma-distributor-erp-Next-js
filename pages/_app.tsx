import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { NextRouter } from 'next/router';
import { useEffect } from 'react';

// FIX: This interface is redundant and seems to cause a type error.
// AppProps already contains all the necessary properties.
/*
interface AppContentProps extends AppProps {
  router: NextRouter;
}
*/

// FIX: Using AppProps directly as the type for the destructured props.
function AppContent({ Component, pageProps, router }: AppProps) {
  const { user, isLoading } = useAuth();

  const publicPages = ['/', '/login', '/register'];
  const isPublicPage = publicPages.includes(router.pathname);

  useEffect(() => {
    if (!isLoading && !user && !isPublicPage) {
      router.push('/');
    }
  }, [isLoading, user, isPublicPage, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (isPublicPage) {
    return <Component {...pageProps} />;
  }

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Redirecting to login...</div>;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}


export default function MyApp(props: AppProps) {
  return (
    <AuthProvider>
      <AppContent {...props} />
    </AuthProvider>
  );
}