import React from 'react';
import { EcommerceOrder, Page } from '../types';
import { PRODUCTS, EMPLOYEES } from '../constants';

interface EcommerceOrderDetailProps {
    order: EcommerceOrder;
    setCurrentPage: (page: Page) => void;
}

const getProductName = (productId: number | null): string => {
    if (!productId) return 'N/A';
    return PRODUCTS.find(p => p.id === productId)?.name || 'Unknown Product';
};

const getSalesmanName = (salesmanId: number | null | undefined): string => {
    if (!salesmanId) return 'N/A';
    return EMPLOYEES.find(e => e.id === salesmanId)?.name || 'Unknown';
}


const EcommerceOrderDetail: React.FC<EcommerceOrderDetailProps> = ({ order, setCurrentPage }) => {
    return (
        <div className="space-y-6">
             <button onClick={() => setCurrentPage('ecommerce')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                &larr; Back to Ecommerce Orders
             </button>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">Order #</h4>
                        <p className="font-semibold text-lg">{order.orderNo}</p>
                    </div>
                     <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">Customer</h4>
                        <p className="font-semibold">{order.customer?.name}</p>
                    </div>
                     <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">Order Date</h4>
                        <p className="font-semibold">{order.date}</p>
                    </div>
                     <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">Grand Total</h4>
                        <p className="font-semibold text-lg text-blue-600 dark:text-blue-400">Rs. {order.totalAmount.toFixed(2)}</p>
                    </div>
                </div>
             </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                         <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                             <h3 className="text-lg font-semibold">Order Items</h3>
                         </div>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rate</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-600">
                                    {order.items.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{getProductName(item.productId)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-300">{item.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-300">Rs. {item.rate.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-800 dark:text-gray-200">Rs. {item.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                     {/* Status & Actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                        <div className="space-y-3 text-sm">
                             <div className="flex justify-between"><span className="text-gray-500">Status:</span><span className="font-semibold">{order.status}</span></div>
                             <div className="flex justify-between"><span className="text-gray-500">Salesman:</span><span className="font-semibold">{getSalesmanName(order.salesmanId)}</span></div>
                             <div className="flex justify-between border-t dark:border-gray-700 pt-2 mt-2"><span className="font-bold">Total Amount:</span><span className="font-bold">Rs. {order.totalAmount.toFixed(2)}</span></div>
                             <div className="flex justify-between"><span className="text-gray-500">Paid Amount:</span><span className="font-semibold text-green-600">Rs. {order.paidAmount.toFixed(2)}</span></div>
                             {order.saleInvoiceId && <div className="flex justify-between"><span className="text-gray-500">Sale Invoice:</span><span className="font-semibold">{order.saleInvoiceId}</span></div>}
                             <div className="pt-2">
                                <h4 className="font-semibold text-gray-600 dark:text-gray-400">Shipping Address</h4>
                                <p className="text-gray-500 dark:text-gray-300 whitespace-pre-wrap">{order.address || 'No address provided.'}</p>
                             </div>
                        </div>
                    </div>
                </div>
              </div>
        </div>
    );
};

export default EcommerceOrderDetail;
