import { PaginatedEcommerceOrders, ApiEcommerceOrder, EcommerceOrder, EcommerceOrderItem, Party, EcommerceOrderStatus } from '../types';
import { PARTIES_DATA } from '../constants'; // To find full customer object

const API_BASE_URL = 'http://127.0.0.1:8000';

const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return sessionStorage.getItem('authToken');
    }
    return null;
};

const getHeaders = () => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };
    if (token) {
        // Assuming 'Token' authentication scheme from Django REST Framework
        headers['Authorization'] = `Token ${token}`;
    }
    return headers;
};


// Transformation function to map API response to the app's data structure
const transformApiOrderToLocal = (apiOrder: ApiEcommerceOrder): EcommerceOrder => {
    // Find the full Party object from constants to populate the customer field fully
    //const customerParty = PARTIES_DATA.find(p => p.id === apiOrder.customer.id) || null;

    const items: EcommerceOrderItem[] = apiOrder.items.map(item => ({
        id: String(item.id),
        product: item.product.name || null,
        quantity: item.quantity,
        rate: parseFloat(item.price),
        bid_price: parseFloat(item.bid_price),
        amount: parseFloat(item.amount),
    }));

    return {
        id: String(apiOrder.id),
        orderNo: apiOrder.order_no,
        date: apiOrder.date,
        customerId: apiOrder.customer.id,
        customer: apiOrder.customer.name,
        salesman: apiOrder.salesman?.name || null,
        status: apiOrder.status,
        totalAmount: parseFloat(apiOrder.total_amount),
        paidAmount: parseFloat(apiOrder.paid_amount),
        address: apiOrder.address,
        items: items,
        saleInvoiceId: apiOrder.saleInvoiceId || null,
    };
};

export const fetchEcommerceOrders = async (limit = 10, offset = 0): Promise<{count: number, orders: EcommerceOrder[]}> => {
    const response = await fetch(`${API_BASE_URL}/ecommerce/orders/?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: getHeaders(),
        
    });

    if (!response.ok) {
        throw new Error('Failed to fetch ecommerce orders');
    }

    const data: PaginatedEcommerceOrders = await response.json();
    
    return {
        count: data.count,
        orders: data.results.map(transformApiOrderToLocal)
    };
};

export const fetchEcommerceOrderById = async (orderId: string | number): Promise<EcommerceOrder> => {
    const response = await fetch(`${API_BASE_URL}/ecommerce/orders/${orderId}/`, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to fetch ecommerce order ${orderId}`);
    }
    const data: ApiEcommerceOrder = await response.json();
    // console.log('Updated order from server:', data);
    const transData=transformApiOrderToLocal(data);
    // console.log('Transforming API order to local format:', transData);
    return transData;
};


export const updateEcommerceOrderStatus = async (orderId: string | number, status: EcommerceOrderStatus): Promise<EcommerceOrder> => {
    const response = await fetch(`${API_BASE_URL}/ecommerce/orders/${orderId}/status/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({status:status }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update order status');
    }

    const data: ApiEcommerceOrder = await response.json();
    // console.log('Updated order from server:', data);
    const transData=transformApiOrderToLocal(data);
    // console.log('Transforming API order to local format:', transData);
    return transData;
};
