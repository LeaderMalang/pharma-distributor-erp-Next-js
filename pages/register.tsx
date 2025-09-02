import CustomerRegistrationComponent from '../components/Register';
import { useRouter } from 'next/router';

export default function RegisterPage() {
    const router = useRouter();
    return <CustomerRegistrationComponent setCurrentPage={(page) => router.push(page === 'login' ? '/' : `/${page}`)} />;
}
