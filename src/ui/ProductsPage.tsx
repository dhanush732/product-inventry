import React, { useEffect, useState } from 'react';

interface Product { id: string; name: string; description?: string; price: number; currency: string; stock: number; category?: string; imageUrl?: string; createdAt: string; updatedAt: string; }
interface Draft { name: string; description?: string; price: string; currency: string; stock: string; category?: string; imageUrl?: string; }
const emptyDraft: Draft = { name: '', price: '', currency: 'USD', stock: '' };

// Predefined categories for e-commerce
const CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty', 'Sports', 'Books', 'Toys', 'Automotive', 'Other'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY'];

export const ProductsPage: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name'|'price'|'stock'|'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [notification, setNotification] = useState<{message: string, type: 'success'|'error'}|null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/products.json');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setItems(data);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(()=> { load(); }, []);

  function openCreate() { setEditingId(null); setDraft(emptyDraft); setDrawerOpen(true); }
  function openEdit(p: Product) { setEditingId(p.id); setDraft({ name: p.name, description: p.description, price: String(p.price), currency: p.currency, stock: String(p.stock), category: p.category, imageUrl: p.imageUrl }); setDrawerOpen(true);} 
  function closeDrawer() { setDrawerOpen(false); setError(null); }

  function updateDraft<K extends keyof Draft>(k: K, v: Draft[K]) { setDraft(d => ({ ...d, [k]: v })); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const payload = serialize(draft);
      const url = editingId ? `/api/products/${editingId}.json` : '/api/products.json';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      
      if (!res.ok) {
        let msg = 'Save failed';
        const text = await res.text();
        try { 
          const j = JSON.parse(text); 
          msg = j.error || j.message || msg; 
        } catch {}
        throw new Error(msg);
      }
      
      await load();
      closeDrawer();
      setNotification({
        message: editingId ? 'Product updated successfully' : 'Product created successfully',
        type: 'success'
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (e: any) { 
      setError(e.message); 
    } finally { 
      setSaving(false); 
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this product?')) return;
    try {
      const r = await fetch(`/api/products/${id}.json`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Delete failed');
      setItems(list => list.filter(p => p.id !== id));
      setNotification({
        message: 'Product deleted successfully',
        type: 'success'
      });
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (e: any) { 
      setNotification({
        message: e.message,
        type: 'error'
      });
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  }

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc':'asc'); else { setSortKey(key); setSortDir('asc'); }
  }

  const filtered = items.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a,b)=>{
    let v = 0;
    if (sortKey === 'name') v = a.name.localeCompare(b.name);
    else if (sortKey === 'price') v = a.price - b.price;
    else if (sortKey === 'stock') v = a.stock - b.stock;
    else v = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortDir === 'asc' ? v : -v;
  });

  // Get unique categories from products
  const categories = ['', ...new Set(items.map(p => p.category).filter(Boolean) as string[])];

  return (
    <div className="relative" data-inventory-page>
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {notification.message}
        </div>
      )}
      
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Inventory</h1>
            <p className="text-slate-400 text-sm">Manage your product catalog</p>
          </div>
          <div className="flex gap-2">
            <button onClick={openCreate} className="btn-primary flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              Add Product
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-400 mb-1">Search Products</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </div>
                <input
                  type="search"
                  placeholder="Search by name, description or category..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs font-medium text-slate-400 mb-1">Filter by Category</label>
              <select 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)}
                className="input w-full"
              >
                <option value="">All Categories</option>
                {categories.filter(c => c).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button onClick={load} className="btn-outline flex items-center gap-1 h-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                <path d="M16 21h5v-5"></path>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-400 text-sm p-3 rounded-md">{error}</div>}

        <div className="overflow-auto border border-slate-700 rounded-lg bg-slate-800/50">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-700/50 text-left">
              <tr>
                <Th onClick={()=>toggleSort('name')} active={sortKey==='name'} dir={sortDir}>Product</Th>
                <Th onClick={()=>toggleSort('price')} active={sortKey==='price'} dir={sortDir} className="w-32">Price</Th>
                <Th onClick={()=>toggleSort('stock')} active={sortKey==='stock'} dir={sortDir} className="w-24">Stock</Th>
                <Th className="w-32">Category</Th>
                <Th className="w-40 text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="p-8 text-center text-slate-400">
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading inventory...</span>
                </div>
              </td></tr>}
              {!loading && filtered.map(p => (
                <tr key={p.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                  <td className="p-3 font-medium text-white">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-md bg-slate-700" /> : 
                        <div className="w-12 h-12 rounded-md bg-slate-700 flex items-center justify-center text-[10px] text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                            <circle cx="9" cy="9" r="2"></circle>
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                          </svg>
                        </div>
                      }
                      <div>
                        <div className="font-medium">{p.name}</div>
                        {p.description && <div className="text-xs text-slate-400 max-w-xs truncate">{p.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-primary-300">{p.currency} {p.price.toFixed(2)}</td>
                  <td className="p-3">
                    <div className={`text-center rounded-full px-2 py-1 text-xs ${
                      p.stock === 0 ? 'bg-red-500/20 text-red-400' : 
                      p.stock < 5 ? 'bg-orange-500/20 text-orange-400' : 
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                    </div>
                  </td>
                  <td className="p-3 text-slate-300">
                    {p.category ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-200">
                        {p.category}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={()=>openEdit(p)} 
                        className="btn-outline text-xs h-8 px-3 hover:bg-slate-700"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={()=>remove(p.id)} 
                        className="btn-outline text-xs h-8 px-3 border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"></path>
                        <path d="M9 2v6h6"></path>
                        <path d="M12 18v-6"></path>
                        <path d="M8 18h8"></path>
                      </svg>
                      <div className="text-lg font-medium">No products found</div>
                      <p className="text-slate-400 text-sm">
                        {search || filterCategory ? 
                          'Try adjusting your search or filter criteria' : 
                          'Get started by adding your first product'}
                      </p>
                      {!search && !filterCategory && (
                        <button onClick={openCreate} className="btn-primary mt-2">Add Product</button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="text-xs text-slate-500 text-right">
          Total: {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={closeDrawer} />
          <form onSubmit={save} className="relative w-full max-w-md h-full overflow-y-auto bg-slate-900 border-l border-slate-700 p-6 flex flex-col gap-5 ml-auto animate-slide-in-right">
            <div className="flex justify-between items-center pb-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button type="button" onClick={closeDrawer} className="text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
            
            {error && <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-md text-sm">{error}</div>}
            
            <Field label="Product Name" required>
              <input 
                required 
                minLength={2} 
                maxLength={100}
                className="input" 
                value={draft.name} 
                onChange={e=>updateDraft('name', e.target.value)} 
                placeholder="Enter product name"
              />
            </Field>
            
            <Field label="Description">
              <textarea 
                className="input min-h-24" 
                value={draft.description||''} 
                onChange={e=>updateDraft('description', e.target.value)} 
                placeholder="Describe your product (optional)"
              />
            </Field>
            
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price" required>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    {draft.currency}
                  </div>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    min="0"
                    className="input pl-12" 
                    value={draft.price} 
                    onChange={e=>updateDraft('price', e.target.value)} 
                    placeholder="0.00"
                  />
                </div>
              </Field>
              <Field label="Currency">
                <select 
                  required 
                  className="input" 
                  value={draft.currency} 
                  onChange={e=>updateDraft('currency', e.target.value)}
                >
                  {CURRENCIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Field label="Stock Quantity">
                <input 
                  type="number" 
                  min="0"
                  className="input" 
                  value={draft.stock} 
                  onChange={e=>updateDraft('stock', e.target.value)} 
                  placeholder="0"
                />
              </Field>
              <Field label="Category">
                <select 
                  className="input" 
                  value={draft.category||''} 
                  onChange={e=>updateDraft('category', e.target.value)}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
            
            <Field label="Image URL">
              <input 
                className="input" 
                value={draft.imageUrl||''} 
                onChange={e=>updateDraft('imageUrl', e.target.value)} 
                placeholder="https://example.com/image.jpg"
              />
              {draft.imageUrl && (
                <div className="mt-2 p-2 border border-slate-700 rounded-md bg-slate-800 flex items-center gap-3">
                  <img src={draft.imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-md bg-slate-700" />
                  <div className="text-xs text-slate-400">Image Preview</div>
                </div>
              )}
            </Field>
            
            <div className="mt-auto pt-4 border-t border-slate-700 flex gap-2">
              <button 
                disabled={saving} 
                type="submit" 
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {saving && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {saving ? 'Saving...' : (editingId ? 'Update Product' : 'Create Product')}
              </button>
              <button type="button" onClick={closeDrawer} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <label className="flex flex-col gap-1 text-sm font-medium text-slate-300">{label}{required && ' *'}{children}</label>
);

const Th: React.FC<{ children: React.ReactNode; onClick?: ()=>void; active?: boolean; dir?: string; className?: string }> = ({ children, onClick, active, dir, className }) => (
  <th onClick={onClick} className={`p-3 text-xs font-semibold select-none ${onClick ? 'cursor-pointer hover:text-primary-300' : ''} ${active ? 'text-primary-300' : 'text-slate-300'} ${className||''}`}>
    <div className="flex items-center gap-1">
      <span>{children}</span>
      {active && <span>{dir==='asc'? '↑':'↓'}</span>}
    </div>
  </th>
);

function serialize(d: Draft) {
  return {
    name: d.name,
    description: d.description || undefined,
    price: d.price ? Number(d.price) : 0,
    currency: d.currency,
    stock: d.stock ? Number(d.stock) : 0,
    category: d.category || undefined,
    imageUrl: d.imageUrl || undefined
  };
}

export default ProductsPage;
