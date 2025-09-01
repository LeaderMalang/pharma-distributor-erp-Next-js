import React, { useState, useMemo } from 'react';
import { Company, ProductGroup, Distributor, City, Branch, Warehouse, Party, ChartOfAccount, Product, PartyType, AccountTypeName, Area, PriceList, PriceListItem } from '../types';
import { ICONS, COMPANIES, PRODUCT_GROUPS, DISTRIBUTORS, CITIES, BRANCHES_DATA, WAREHOUSES_DATA, PARTIES_DATA, CHART_OF_ACCOUNTS_DATA, PRODUCTS, AREAS, PRICE_LISTS, PRICE_LIST_ITEMS } from '../constants';
import { FilterBar, FilterControls } from './FilterBar';
import { SearchInput } from './SearchInput';
import SearchableSelect from './SearchableSelect';
import { addToSyncQueue, registerSync } from '../services/db';

type ManagementTab = 'organization' | 'product_masters' | 'products' | 'parties' | 'pricing' | 'accounting';
type EntityType = 'branch' | 'warehouse' | 'city' | 'area' | 'company' | 'group' | 'distributor' | 'product' | 'party' | 'account' | 'priceList' | 'priceListItem';
type ModalType = 'add' | 'edit';
type SortDirection = 'asc' | 'desc';


// Main Component
const Management: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ManagementTab>('organization');
    
    // State for all managed data
    const [branches, setBranches] = useState<Branch[]>(BRANCHES_DATA);
    const [warehouses, setWarehouses] = useState<Warehouse[]>(WAREHOUSES_DATA);
    const [cities, setCities] = useState<City[]>(CITIES);
    const [areas, setAreas] = useState<Area[]>(AREAS);
    const [companies, setCompanies] = useState<Company[]>(COMPANIES);
    const [productGroups, setProductGroups] = useState<ProductGroup[]>(PRODUCT_GROUPS);
    const [distributors, setDistributors] = useState<Distributor[]>(DISTRIBUTORS);
    const [products, setProducts] = useState<Product[]>(PRODUCTS);
    const [parties, setParties] = useState<Party[]>(PARTIES_DATA);
    const [accounts, setAccounts] = useState<ChartOfAccount[]>(CHART_OF_ACCOUNTS_DATA);
    const [priceLists, setPriceLists] = useState<PriceList[]>(PRICE_LISTS);
    const [priceListItems, setPriceListItems] = useState<PriceListItem[]>(PRICE_LIST_ITEMS);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalType>('add');
    const [entityType, setEntityType] = useState<EntityType | null>(null);
    const [currentItem, setCurrentItem] = useState<any>(null);

    const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);

    const [filters, setFilters] = useState({
        products: { searchTerm: '', companyId: 'All', groupId: 'All' },
        parties: { searchTerm: '', partyType: 'All' },
        accounts: { searchTerm: '', accountType: 'All' },
    });

    const handleFilterChange = (tab: keyof typeof filters, key: string, value: any) => {
        setFilters(prev => ({ ...prev, [tab]: { ...prev[tab], [key]: value } }));
    };

    const filteredProducts = useMemo(() => {
        const { searchTerm, companyId, groupId } = filters.products;
        return products.filter(p => 
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm)) &&
            (companyId === 'All' || p.companyId === Number(companyId)) &&
            (groupId === 'All' || p.groupId === Number(groupId))
        );
    }, [products, filters.products]);

    const filteredParties = useMemo(() => {
        const { searchTerm, partyType } = filters.parties;
        return parties.filter(p => (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm)) && (partyType === 'All' || p.partyType === partyType));
    }, [parties, filters.parties]);
    
    const filteredAccounts = useMemo(() => {
        const { searchTerm, accountType } = filters.accounts;
        return accounts.filter(a => (a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.code.includes(searchTerm)) && (accountType === 'All' || a.accountType === accountType));
    }, [accounts, filters.accounts]);
    
    const filteredPriceListItems = useMemo(() => {
        if (!selectedPriceList) return [];
        return priceListItems.filter(item => item.priceListId === selectedPriceList.id);
    }, [priceListItems, selectedPriceList]);


    const openModal = (type: EntityType, mode: ModalType, item?: any) => {
        setEntityType(type);
        setModalMode(mode);
        setCurrentItem(item || null);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSave = async (newItem: any) => {
        const endpointMap: Record<EntityType, string> = {
            branch: '/api/management/branches', warehouse: '/api/management/warehouses', city: '/api/management/cities', area: '/api/management/areas',
            company: '/api/management/companies', group: '/api/management/product-groups', distributor: '/api/management/distributors',
            product: '/api/management/products', party: '/api/management/parties', account: '/api/management/accounts',
            priceList: '/api/management/price-lists', priceListItem: `/api/management/price-lists/${newItem.priceListId}/items`,
        };
        const endpoint = endpointMap[entityType!];
        const method = modalMode === 'add' ? 'POST' : 'PUT';
        await addToSyncQueue({ endpoint, method, payload: newItem });
        await registerSync();
        const updateState = (setter: React.Dispatch<React.SetStateAction<any[]>>, item: any) => {
            setter(prev => modalMode === 'add' ? [...prev, { ...item, id: Date.now() }] : prev.map(i => i.id === item.id ? item : i));
        };
        switch (entityType) {
            case 'branch': updateState(setBranches, newItem); break; case 'warehouse': updateState(setWarehouses, newItem); break;
            case 'city': updateState(setCities, newItem); break; case 'area': updateState(setAreas, newItem); break;
            case 'company': updateState(setCompanies, newItem); break; case 'group': updateState(setProductGroups, newItem); break;
            case 'distributor': updateState(setDistributors, newItem); break; case 'product': updateState(setProducts, newItem); break;
            case 'party': updateState(setParties, newItem); break; case 'account': updateState(setAccounts, newItem); break;
            case 'priceList': updateState(setPriceLists, newItem); break; case 'priceListItem': updateState(setPriceListItems, newItem); break;
        }
        closeModal();
    };
    
    const getDepName = (id: number | undefined, data: {id:number, name:string}[]) => data.find(item => item.id === id)?.name || 'N/A';
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'organization': return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ManagementSection title="Cities" data={cities} onAdd={() => openModal('city', 'add')} onEdit={(item) => openModal('city', 'edit', item)} columns={[{key: 'name', label: 'Name'}]} />
                <ManagementSection title="Areas" data={areas} onAdd={() => openModal('area', 'add')} onEdit={(item) => openModal('area', 'edit', item)} columns={[{key: 'name', label: 'Name'}, {key: 'cityId', label: 'City', render: (val) => getDepName(val, cities)}]} />
                 <ManagementSection title="Branches" data={branches} onAdd={() => openModal('branch', 'add')} onEdit={(item) => openModal('branch', 'edit', item)} columns={[{key: 'name', label: 'Name'}, {key: 'address', label: 'Address'}]} />
                <ManagementSection title="Warehouses" data={warehouses} onAdd={() => openModal('warehouse', 'add')} onEdit={(item) => openModal('warehouse', 'edit', item)} columns={[{key: 'name', label: 'Name'}, {key: 'branchId', label: 'Branch', render: (val) => getDepName(val, branches)}]} />
            </div>
            case 'product_masters': return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ManagementSection title="Companies" data={companies} onAdd={() => openModal('company', 'add')} onEdit={(item) => openModal('company', 'edit', item)} columns={[{key: 'name', label: 'Name'}]} />
                <ManagementSection title="Product Groups" data={productGroups} onAdd={() => openModal('group', 'add')} onEdit={(item) => openModal('group', 'edit', item)} columns={[{key: 'name', label: 'Name'}]} />
                 <ManagementSection title="Distributors" data={distributors} onAdd={() => openModal('distributor', 'add')} onEdit={(item) => openModal('distributor', 'edit', item)} columns={[{key: 'name', label: 'Name'}]} />
            </div>
            case 'products': return <ManagementSection title="Products" data={filteredProducts} onAdd={() => openModal('product', 'add')} onEdit={(item) => openModal('product', 'edit', item)} columns={[{key: 'name', label: 'Name'}, {key: 'barcode', label: 'Barcode'}, {key: 'retailPrice', label: 'Retail Price'}]}/>
            case 'parties': return <ManagementSection title="Parties" data={filteredParties} onAdd={() => openModal('party', 'add')} onEdit={(item) => openModal('party', 'edit', item)} columns={[{key: 'name', label: 'Name'}, {key: 'partyType', label: 'Type'}, {key: 'phone', label: 'Phone'}]}/>
            case 'pricing':
                if (selectedPriceList) {
                    return (
                        <div>
                            <button onClick={() => setSelectedPriceList(null)} className="text-sm text-blue-600 hover:underline mb-4">&larr; Back to Price Lists</button>
                            <ManagementSection 
                                title={`Items for: ${selectedPriceList.name}`} 
                                data={filteredPriceListItems}
                                onAdd={() => openModal('priceListItem', 'add', { priceListId: selectedPriceList.id })}
                                onEdit={(item) => openModal('priceListItem', 'edit', item)}
                                columns={[
                                    { key: 'productId', label: 'Product', render: (val) => getDepName(val, products) }, 
                                    { key: 'customPrice', label: 'Custom Price', render: val => `Rs. ${val.toFixed(2)}` }
                                ]}
                            />
                        </div>
                    );
                }
                return <ManagementSection 
                            title="Price Lists" 
                            data={priceLists} 
                            onAdd={() => openModal('priceList', 'add')} 
                            onEdit={(item) => openModal('priceList', 'edit', item)} 
                            columns={[{key: 'name', label: 'Name'}, {key: 'description', label: 'Description'}]}
                            customActions={(item) => (
                                <button onClick={() => setSelectedPriceList(item)} className="text-indigo-600 hover:text-indigo-900 ml-4">Manage Items</button>
                            )}
                       />;
            case 'accounting': return <ManagementSection title="Chart of Accounts" data={filteredAccounts} onAdd={() => openModal('account', 'add')} onEdit={(item) => openModal('account', 'edit', item)} columns={[{key: 'code', label: 'Code'}, {key: 'name', label: 'Name'}, {key: 'accountType', label: 'Type'}]} />
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
             <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    <TabButton active={activeTab === 'organization'} onClick={() => { setActiveTab('organization'); setSelectedPriceList(null); }}>Organization</TabButton>
                    <TabButton active={activeTab === 'product_masters'} onClick={() => { setActiveTab('product_masters'); setSelectedPriceList(null); }}>Product Masters</TabButton>
                    <TabButton active={activeTab === 'products'} onClick={() => { setActiveTab('products'); setSelectedPriceList(null); }}>Products</TabButton>
                    <TabButton active={activeTab === 'parties'} onClick={() => { setActiveTab('parties'); setSelectedPriceList(null); }}>Parties</TabButton>
                    <TabButton active={activeTab === 'pricing'} onClick={() => setActiveTab('pricing')}>Pricing</TabButton>
                    <TabButton active={activeTab === 'accounting'} onClick={() => { setActiveTab('accounting'); setSelectedPriceList(null); }}>Accounting</TabButton>
                </nav>
            </div>
            <div>{renderTabContent()}</div>
            {isModalOpen && <ManagementFormModal entityType={entityType} mode={modalMode} currentItem={currentItem} onClose={closeModal} onSave={handleSave} dependencies={{ branches, cities, areas, companies, productGroups, distributors, accounts, priceLists, products }} />}
        </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 whitespace-nowrap ${active ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>{children}</button>
);

const ManagementSection: React.FC<{title: string, data: any[], onAdd: () => void, onEdit: (item: any) => void, columns: {key: string, label: string, render?: (val: any) => any}[], customActions?: (item: any) => React.ReactNode}> = ({title, data, onAdd, onEdit, columns, customActions}) => {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection } | null>(null);
    const [pagination, setPagination] = useState({ currentPage: 1, rowsPerPage: 5 });

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.rowsPerPage;
        return sortedData.slice(startIndex, startIndex + pagination.rowsPerPage);
    }, [sortedData, pagination]);

    const requestSort = (key: string) => {
        let direction: SortDirection = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const totalPages = Math.ceil(data.length / pagination.rowsPerPage);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button onClick={onAdd} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    {ICONS.plus}
                    <span className="ml-2">Add New</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {columns.map(col => 
                                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(col.key)}>
                                    <div className="flex items-center">
                                        <span>{col.label}</span>
                                        {sortConfig?.key === col.key && <span className="ml-1">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                                    </div>
                                </th>
                            )}
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-600">
                        {paginatedData.map(item => (
                            <tr key={item.id}>
                                {columns.map(col => (
                                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {col.render ? col.render(item[col.key]) : item[col.key]}
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                    {customActions && customActions(item)}
                                </td>
                            </tr>
                        ))}
                         {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} className="text-center py-12 text-gray-500">
                                    No items found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center text-sm">
                <div>
                    <label>Rows per page: </label>
                    <select value={pagination.rowsPerPage} onChange={e => setPagination({ currentPage: 1, rowsPerPage: Number(e.target.value)})} className="p-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                </div>
                <div>
                    <span>Page {pagination.currentPage} of {totalPages}</span>
                    <button onClick={() => setPagination(p => ({...p, currentPage: p.currentPage - 1}))} disabled={pagination.currentPage === 1} className="ml-2 px-2 py-1 border rounded-md disabled:opacity-50">Prev</button>
                    <button onClick={() => setPagination(p => ({...p, currentPage: p.currentPage + 1}))} disabled={pagination.currentPage === totalPages} className="ml-2 px-2 py-1 border rounded-md disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
};


const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }> = ({ label, className, ...props }) => ( <div className={className}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label><input {...props} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div> );
const FormTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; className?: string }> = ({ label, className, ...props }) => ( <div className={className}><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label><textarea {...props} rows={3} className="mt-1 block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div> );
const FormCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => ( <div className="flex items-center"><input {...props} type="checkbox" className="h-4 w-4 rounded text-blue-600 border-gray-300 dark:border-gray-600 bg-gray-700 focus:ring-blue-500" /><label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{label}</label></div> );
const SearchableSelectWithLabel: React.FC<{ label: string; value: any; onChange: (value: any) => void; options: { value: any; label: string }[]; disabled?: boolean; }> = ({ label, ...props }) => (
    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label><SearchableSelect {...props} /></div>
);
// FIX: Changed component definition to return JSX, resolving the invalid React component error.
const ManagementFormModal: React.FC<{ entityType: any, mode: any, currentItem: any, onClose: any, onSave: any, dependencies: any }> = ({ entityType, mode, currentItem, onClose, onSave, dependencies }) => {
    const [formData, setFormData] = useState(currentItem || {});
    const handleChange = (name: string, value: any) => setFormData({ ...formData, [name]: value });
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'number' ? parseFloat(value) || 0 : value);
        handleChange(name, finalValue);
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    
    const renderFields = () => {
         const { branches, cities, areas, companies, productGroups, distributors, accounts, priceLists, products } = dependencies;
        switch (entityType) {
            case 'branch':
                return <>
                    <FormInput label="Branch Name" name="name" value={formData.name || ''} onChange={handleInputChange} required className="md:col-span-2"/>
                    <FormInput label="Address" name="address" value={formData.address || ''} onChange={handleInputChange} className="md:col-span-2"/>
                </>;
            case 'warehouse':
                return <>
                    <FormInput label="Warehouse Name" name="name" value={formData.name || ''} onChange={handleInputChange} required />
                    <SearchableSelectWithLabel label="Branch" options={branches.map((b: Branch) => ({ value: b.id, label: b.name }))} value={formData.branchId || null} onChange={val => handleChange('branchId', val)} />
                </>;
            case 'city':
                return <FormInput label="City Name" name="name" value={formData.name || ''} onChange={handleInputChange} required className="md:col-span-2" />;
            case 'area':
                return <>
                    <FormInput label="Area Name" name="name" value={formData.name || ''} onChange={handleInputChange} required />
                    <SearchableSelectWithLabel label="City" options={cities.map((c: City) => ({ value: c.id, label: c.name }))} value={formData.cityId || null} onChange={val => handleChange('cityId', val)} />
                </>;
            case 'company':
            case 'group':
            case 'distributor':
                return <FormInput label="Name" name="name" value={formData.name || ''} onChange={handleInputChange} required className="md:col-span-2" />;
            case 'product':
                return <>
                    <FormInput label="Product Name" name="name" value={formData.name || ''} onChange={handleInputChange} required className="md:col-span-2"/>
                    <FormInput label="Barcode" name="barcode" value={formData.barcode || ''} onChange={handleInputChange} />
                    <SearchableSelectWithLabel label="Company" options={companies.map((c: Company) => ({ value: c.id, label: c.name }))} value={formData.companyId || null} onChange={val => handleChange('companyId', val)} />
                    <SearchableSelectWithLabel label="Group" options={productGroups.map((g: ProductGroup) => ({ value: g.id, label: g.name }))} value={formData.groupId || null} onChange={val => handleChange('groupId', val)} />
                    <SearchableSelectWithLabel label="Distributor" options={distributors.map((d: Distributor) => ({ value: d.id, label: d.name }))} value={formData.distributorId || null} onChange={val => handleChange('distributorId', val)} />
                    <FormInput label="Trade Price" name="tradePrice" type="number" value={formData.tradePrice || ''} onChange={handleInputChange} />
                    <FormInput label="Retail Price" name="retailPrice" type="number" value={formData.retailPrice || ''} onChange={handleInputChange} />
                    <FormInput label="Sales Tax %" name="salesTaxRatio" type="number" value={formData.salesTaxRatio || ''} onChange={handleInputChange} />
                    <FormInput label="FED Tax %" name="fedTaxRatio" type="number" value={formData.fedTaxRatio || ''} onChange={handleInputChange} />
                    <div className="md:col-span-2 flex items-center h-full"><FormCheckbox label="Disable Sale/Purchase" name="disableSalePurchase" checked={formData.disableSalePurchase || false} onChange={handleInputChange} /></div>
                </>;
            case 'party':
                const partyTypeOptions: PartyType[] = ['customer', 'supplier', 'investor'];
                return <>
                    <FormInput label="Party Name" name="name" value={formData.name || ''} onChange={handleInputChange} required className="md:col-span-2"/>
                    <FormInput label="Address" name="address" value={formData.address || ''} onChange={handleInputChange} className="md:col-span-2" />
                    <FormInput label="Phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} required />
                    {/* FIX: Changed default value from '' to null to match SearchableSelect's expected types and avoid PartyType mismatch. */}
                    <SearchableSelectWithLabel label="Party Type" options={partyTypeOptions.map(p => ({value: p, label: p.charAt(0).toUpperCase() + p.slice(1)}))} value={formData.partyType || null} onChange={val => handleChange('partyType', val)} />
                    <SearchableSelectWithLabel label="City" options={cities.map((c: City) => ({ value: c.id, label: c.name }))} value={formData.cityId || null} onChange={val => handleChange('cityId', val)} />
                    <SearchableSelectWithLabel label="Area" options={areas.filter((a: Area) => a.cityId === formData.cityId).map((a:Area) => ({value: a.id, label: a.name}))} value={formData.areaId || null} onChange={val => handleChange('areaId', val)} disabled={!formData.cityId}/>
                    <FormInput label="Proprietor" name="proprietor" value={formData.proprietor || ''} onChange={handleInputChange} />
                    <FormInput label="License No." name="licenseNo" value={formData.licenseNo || ''} onChange={handleInputChange} />
                    <FormInput label="License Expiry" name="licenseExpiry" type="date" value={formData.licenseExpiry || ''} onChange={handleInputChange} />
                    <FormInput label="Category" name="category" value={formData.category || ''} onChange={handleInputChange} />
                    <FormInput label="Credit Limit" name="creditLimit" type="number" value={formData.creditLimit || ''} onChange={handleInputChange} />
                    <SearchableSelectWithLabel label="Price List" options={priceLists.map((p: PriceList) => ({ value: p.id, label: p.name }))} value={formData.priceListId || null} onChange={val => handleChange('priceListId', val)} />
                </>;
            case 'account':
                const accountTypeOptions: AccountTypeName[] = ['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY'];
                return <>
                    <FormInput label="Account Name" name="name" value={formData.name || ''} onChange={handleInputChange} required />
                    <FormInput label="Code" name="code" value={formData.code || ''} onChange={handleInputChange} required />
                    <SearchableSelectWithLabel label="Account Type" options={accountTypeOptions.map(t => ({value: t, label: t}))} value={formData.accountType || null} onChange={val => handleChange('accountType', val)} />
                    <SearchableSelectWithLabel label="Parent Account" options={accounts.map((a: ChartOfAccount) => ({value: a.id, label: a.name}))} value={formData.parentId || null} onChange={val => handleChange('parentId', val)} />
                    <div className="md:col-span-2 flex items-center h-full"><FormCheckbox label="Is Active" name="isActive" checked={formData.isActive !== false} onChange={handleInputChange} /></div>
                </>;
            case 'priceList':
                 return <>
                    <FormInput label="List Name" name="name" value={formData.name || ''} onChange={handleInputChange} required className="md:col-span-2"/>
                    <FormTextarea label="Description" name="description" value={formData.description || ''} onChange={handleInputChange} className="md:col-span-2"/>
                </>;
            case 'priceListItem':
                 return <>
                    <SearchableSelectWithLabel label="Product" options={products.map((p: Product) => ({ value: p.id, label: p.name }))} value={formData.productId || null} onChange={val => handleChange('productId', val)} />
                    <FormInput label="Custom Price" name="customPrice" type="number" value={formData.customPrice || ''} onChange={handleInputChange} />
                </>;
            default:
                return null;
        }
    };
    
    const title = `${mode === 'add' ? 'Add New' : 'Edit'} ${entityType.replace(/_/g, ' ').replace(/(?:^|\s)\S/g, (a: string) => a.toUpperCase())}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold">{title}</h3>
                </div>
                <fieldset className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                    {renderFields()}
                </fieldset>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-2 mt-auto">
                    <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Save & Sync</button>
                </div>
            </form>
        </div>
    );
};

export default Management;
