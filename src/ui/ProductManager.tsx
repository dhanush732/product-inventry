import React, { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  stock: number;
  category?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface DraftProduct {
  name: string;
  description?: string;
  price: number | '';
  currency: string;
  stock: number | '';
  category?: string;
  imageUrl?: string;
}

const emptyDraft: DraftProduct = { name: '', price: '', currency: 'USD', stock: '' };

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftProduct>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/products.json');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      setError('Failed to load products');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function handleChange<K extends keyof DraftProduct>(key: K, value: DraftProduct[K]) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setDraft({
      name: p.name,
      description: p.description,
      price: p.price,
      currency: p.currency,
      stock: p.stock,
      category: p.category,
      imageUrl: p.imageUrl
    });
  }

  function resetForm() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      if (editingId) {
        const res = await fetch(`/api/products/${editingId}.json`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serializeDraft(draft)) });
        if (!res.ok) throw new Error('Update failed');
      } else {
        const res = await fetch('/api/products.json', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serializeDraft(draft)) });
        if (!res.ok) throw new Error('Create failed');
      }
      await load();
      resetForm();
    } catch (e: any) {
      setError(e.message || 'Operation failed');
    } finally { setSubmitting(false); }
  }

  async function remove(id: string) {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}.json`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setProducts(p => p.filter(x => x.id !== id));
      if (editingId === id) resetForm();
    } catch (e: any) { setError(e.message); }
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={submitForm} className="space-y-4 card">
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="input" value={draft.name} onChange={e=>handleChange('name', e.target.value)} required minLength={2} />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea className="input h-24" value={draft.description||''} onChange={e=>handleChange('description', e.target.value)} maxLength={500} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Price</label>
              <input className="input" type="number" step="0.01" value={draft.price} onChange={e=>handleChange('price', e.target.value === '' ? '' : Number(e.target.value))} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Currency</label>
              <input className="input" value={draft.currency} onChange={e=>handleChange('currency', e.target.value.toUpperCase())} maxLength={3} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Stock</label>
              <input className="input" type="number" value={draft.stock} onChange={e=>handleChange('stock', e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm mb-1">Category</label>
              <input className="input" value={draft.category||''} onChange={e=>handleChange('category', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Image URL</label>
            <input className="input" value={draft.imageUrl||''} onChange={e=>handleChange('imageUrl', e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2">
            <button disabled={submitting} className="btn-primary flex-1" type="submit">{editingId ? 'Update' : 'Create'}</button>
            {editingId && <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>}
          </div>
        </form>
      </div>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Products</h2>
          <button onClick={load} className="btn-outline text-xs">Refresh</button>
        </div>
        {loading ? <div>Loading...</div> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(p => <div key={p.id} className="card relative group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold leading-tight pr-2 line-clamp-2">{p.name}</h3>
                <span className="badge">{p.currency} {p.price.toFixed(2)}</span>
              </div>
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="rounded mb-2 h-32 w-full object-cover" />}
              <p className="text-xs text-slate-400 line-clamp-3 mb-3 min-h-[2.5rem]">{p.description||'No description'}</p>
              <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                <span>Stock: {p.stock}</span>
                {p.category && <span>{p.category}</span>}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button onClick={()=>startEdit(p)} className="btn-outline text-xs flex-1">Edit</button>
                <button onClick={()=>remove(p.id)} className="btn-outline text-xs flex-1 border-red-400 text-red-300 hover:bg-red-500/10">Delete</button>
              </div>
            </div>)}
            {products.length === 0 && <div className="text-slate-400 text-sm">No products yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

function serializeDraft(d: DraftProduct) {
  return {
    name: d.name,
    description: d.description || undefined,
    price: typeof d.price === 'number' ? d.price : 0,
    currency: d.currency,
    stock: typeof d.stock === 'number' ? d.stock : 0,
    category: d.category || undefined,
    imageUrl: d.imageUrl || undefined
  };
}

export default ProductManager;
