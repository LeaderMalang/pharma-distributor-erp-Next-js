import React from 'react';
import { User, Page } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  currentUser: User | null;
  currentPage?: Page;
  setCurrentPage?: (page: Page) => void;
}

const NavHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="px-4 mt-6 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
    {children}
  </h3>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  page: Page;
  isSelected: boolean;
  onClick: (page: Page) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, page, isSelected, onClick }) => {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick(page);
      }}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-150 rounded-r-full mr-4 ${
        isSelected
          ? 'text-white bg-blue-600'
          : 'text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
    >
      <span className="mr-4">{icon}</span>
      <span className="w-full text-left">{label}</span>
    </a>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setSidebarOpen, currentUser, currentPage, setCurrentPage }) => {
  const handleNavClick = (page: Page) => {
    if (setCurrentPage) {
        setCurrentPage(page);
    }
    // Close sidebar on navigation in mobile view
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  
  const role = currentUser?.role;

  const renderNavItems = () => {
    // A helper to create NavItem props easily
    const navItem = (label: string, page: Page, icon: React.ReactNode) => (
      <NavItem
        label={label}
        page={page}
        icon={icon}
        isSelected={currentPage === page}
        onClick={handleNavClick}
      />
    );

    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <>
            {navItem('Dashboard', 'dashboard', ICONS.dashboard)}
            <NavHeader>Orders</NavHeader>
            {navItem('Sale Invoices', 'order-management', ICONS.orders)}
            {navItem('Ecommerce Orders', 'ecommerce', ICONS.ecommerce)}
            <NavHeader>Sales</NavHeader>
            {navItem('CRM', 'crm', ICONS.crm)}
            {navItem('Point of Sale', 'pos', ICONS.pos)}
            {navItem('Create Sale Invoice', 'new-sale-invoice', ICONS.plus)}
            {navItem('Create Sale Return', 'new-sale-return', ICONS.return)}
            {navItem('Sale Returns', 'sale-returns', ICONS.list)}
            <NavHeader>Purchases</NavHeader>
            {navItem('Create Purchase Invoice', 'new-purchase-invoice', ICONS.plus)}
            {navItem('Purchase Invoices', 'purchase-invoices', ICONS.list)}
            {navItem('Create Purchase Return', 'new-purchase-return', ICONS.return)}
            {navItem('Purchase Returns', 'purchase-returns', ICONS.list)}
            <NavHeader>Operations</NavHeader>
            {navItem('Credit Recovery', 'credit-recovery', ICONS.recovery)}
            {navItem('Ledger', 'ledger', ICONS.ledger)}
            {navItem('Tasks', 'tasks', ICONS.tasks)}
            {navItem('Reports', 'reports', ICONS.reports)}
            {navItem('Inventory', 'inventory', ICONS.inventory)}
            {navItem('Stock Audit', 'stock-audit', ICONS.stock_audit)}
            {navItem('HR', 'hr', ICONS.hr)}
            <NavHeader>Finance</NavHeader>
            {navItem('Expenses', 'expenses', ICONS.expense)}
            {navItem('Investors', 'investors', ICONS.investor)}
            <NavHeader>System</NavHeader>
            {navItem('Management', 'management', ICONS.management)}
          </>
        );
      case 'WAREHOUSE_ADMIN':
        return (
          <>
            {navItem('Dashboard', 'dashboard', ICONS.dashboard)}
            <NavHeader>Operations</NavHeader>
            {navItem('Inventory', 'inventory', ICONS.inventory)}
            {navItem('Stock Audit', 'stock-audit', ICONS.stock_audit)}
            {navItem('My Tasks', 'tasks', ICONS.tasks)}
            {navItem('My Leave', 'my-leave', ICONS.leave)}
          </>
        );
      case 'CUSTOMER':
         return (
          <>
            {navItem('Dashboard', 'dashboard', ICONS.dashboard)}
            <NavHeader>My Account</NavHeader>
            {navItem('My Orders', 'my-orders', ICONS.orders)}
            {navItem('My Ledger', 'ledger', ICONS.ledger)}
            {navItem('Place New Order', 'new-sale-invoice', ICONS.plus)}
          </>
        );
      // ... Add other roles here following the same pattern
      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile-only overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          aria-hidden="true"
        ></div>
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-2xl font-bold text-white">PharmaERP</h1>
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <nav className="flex-1 mt-2 overflow-y-auto">
          {renderNavItems()}
        </nav>
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <p className="text-xs text-gray-500">&copy; 2024 PharmaSoft Inc.</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;