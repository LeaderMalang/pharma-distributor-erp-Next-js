import React, { useState, useMemo } from 'react';
import { Page, Order, EcommerceOrder, EcommerceOrderStatus, InvoiceItem } from '../types';
import { ICONS } from '../constants';
import { FilterBar, FilterControls } from './FilterBar';
import { SearchInput } from './SearchInput';

interface EcommerceOrdersProps {
  orders: EcommerceOrder[];
  setCurrentPage: (page: Page) => void;
  handleEditSaleInvoice: (invoice: Order) => void;
  viewOrderDetails: (order: EcommerceOrder) => void;
  onStatusChange: (orderId: string, newStatus: EcommerceOrderStatus) => Promise<void>;
  totalOrders: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
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

const EcommerceOrders: React.FC<EcommerceOrdersProps> = ({ orders, setCurrentPage, handleEditSaleInvoice, viewOrderDetails, onStatusChange, totalOrders, currentPage, rowsPerPage, onPageChange, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<EcommerceOrderStatus | 'All'>('All');

    // Filtering is now client-side on the paginated data. For server-side filtering, these would be passed up.
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                order.orderNo.toLowerCase().includes(searchLower) ||
                (order.customer && order.customer.toLowerCase().includes(searchLower));

            const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, searchTerm, statusFilter]);

    const handleStatusChange = async (orderId: string, newStatus: EcommerceOrderStatus) => {
        await onStatusChange(orderId, newStatus);
    };

    const handleConvertToSaleInvoice = (ecomOrder: EcommerceOrder) => {
        const saleInvoiceItems: InvoiceItem[] = ecomOrder.items.map(item => ({
            id: `si-${item.id}`,
            productId: null, // This will need mapping if product IDs are available
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
            customer: null, // This would need to be fetched/found
            cityId: null,
            areaId: null,
            supplyingManId: null, // This would need mapping
            bookingManId: null,
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
    
    const totalPages = Math.ceil(totalOrders / rowsPerPage);
    const startRecord = totalOrders === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const endRecord = Math.min(currentPage * rowsPerPage, totalOrders);

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
            <div className="overflow-x-auto relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex items-center justify-center z-10" aria-hidden="true">
                        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Salesman</th>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.customer}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.salesman}</td>
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
                            <tr><td colSpan={7} className="text-center py-12 text-gray-500">No orders match your filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center text-sm gap-4">
                <div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Showing <span className="font-medium text-gray-800 dark:text-gray-200">{startRecord}</span> to <span className="font-medium text-gray-800 dark:text-gray-200">{endRecord}</span> of <span className="font-medium text-gray-800 dark:text-gray-200">{totalOrders}</span> results
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Previous
                    </button>
                    <span className="text-gray-600 dark:text-gray-400">
                        Page <span className="font-medium text-gray-800 dark:text-gray-200">{currentPage}</span> of <span className="font-medium text-gray-800 dark:text-gray-200">{totalPages}</span>
                    </span>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EcommerceOrders;
