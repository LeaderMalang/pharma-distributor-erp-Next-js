import React, { useState, useMemo } from 'react';
import { Page, Order, EcommerceOrder, EcommerceOrderStatus, InvoiceItem } from '../types';
import { ECOMMERCE_ORDERS, ICONS } from '../constants';
import { FilterBar, FilterControls } from './FilterBar';
import { SearchInput } from './SearchInput';
import { addToSyncQueue, registerSync } from '../services/db';

interface EcommerceOrdersProps {
  setCurrentPage: (page: Page) => void;
  handleEditSaleInvoice: (invoice: Order) => void;
  viewOrderDetails: (order: EcommerceOrder) => void;
}

const StatusBadge: React.FC<{ status: EcommerceOrderStatus }> = ({ status }) => {
    const colorClasses = {
        'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        'Confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    }[status];
    
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>{status}</span>;
};

const EcommerceOrders: React.FC<EcommerceOrdersProps> = ({ setCurrentPage, handleEditSaleInvoice, viewOrderDetails }) => {
    const [orders, setOrders] = useState<EcommerceOrder[]>(ECOMMERCE_ORDERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<EcommerceOrderStatus | 'All'>('All');

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                order.orderNo.toLowerCase().includes(searchLower) ||
                order.customer?.name.toLowerCase().includes(searchLower);

            const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, searchTerm, statusFilter]);

    const handleStatusChange = async (orderId: string, newStatus: EcommerceOrderStatus) => {
        const payload = { status: newStatus };
        await addToSyncQueue({ endpoint: `/api/ecommerce-orders/${orderId}`, method: 'PATCH', payload });
        await registerSync();
        
        setOrders(prevOrders => prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    const handleConvertToSaleInvoice = (ecomOrder: EcommerceOrder) => {
        const saleInvoiceItems: InvoiceItem[] = ecomOrder.items.map(item => ({
            id: `si-${item.id}`,
            productId: item.productId,
            batchId: null,
            quantity: item.quantity,
            bonus: 0,
            rate: item.rate,
            amount: item.amount,
            discount1: 0,
            discount2: 0,
            netAmount: item.amount,
        }));

        const saleInvoiceToCreate: Order = {
            id: new Date().getTime().toString(),
            invoiceNo: '', // Will be generated in the form
            status: 'Draft',
            userId: ecomOrder.customerId,
            customer: ecomOrder.customer || null,
            cityId: ecomOrder.customer?.cityId || null,
            areaId: ecomOrder.customer?.areaId || null,
            supplyingManId: ecomOrder.salesmanId || null,
            bookingManId: ecomOrder.salesmanId || null,
            date: new Date().toISOString().split('T')[0],
            items: saleInvoiceItems,
            subTotal: ecomOrder.totalAmount,
            discount: 0,
            tax: 17, // default tax, can be changed in form
            grandTotal: ecomOrder.totalAmount,
            qrCode: null,
            paymentMethod: ecomOrder.paidAmount >= ecomOrder.totalAmount ? 'Cash' : 'Credit',
            paidAmount: ecomOrder.paidAmount,
            companyName: '',
        };

        handleEditSaleInvoice(saleInvoiceToCreate);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Ecommerce Orders</h3>
            </div>
            <FilterBar>
                <SearchInput
                    placeholder="Search by Order# or Customer..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <FilterControls.Select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                >
                    <option value="All">All Statuses</option>
                    {(['Pending', 'Confirmed', 'Cancelled', 'Completed'] as EcommerceOrderStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                </FilterControls.Select>
                <FilterControls.ResetButton onClick={() => { setSearchTerm(''); setStatusFilter('All'); }} />
            </FilterBar>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                        {filteredOrders.map(order => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.orderNo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.customer?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Rs. {order.totalAmount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button onClick={() => viewOrderDetails(order)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Details</button>
                                    {order.status === 'Pending' && (
                                        <>
                                            <button onClick={() => handleStatusChange(order.id, 'Confirmed')} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Confirm</button>
                                            <button onClick={() => handleStatusChange(order.id, 'Cancelled')} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Cancel</button>
                                        </>
                                    )}
                                    {order.status === 'Confirmed' && !order.saleInvoiceId && (
                                        <button onClick={() => handleConvertToSaleInvoice(order)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Convert to Invoice</button>
                                    )}
                                    {order.saleInvoiceId && <span className="text-xs text-gray-400 italic">Invoiced</span>}
                                </td>
                            </tr>
                        ))}
                         {filteredOrders.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-500">No orders match your filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EcommerceOrders;