import React, { useEffect, useState } from 'react';

interface DraftProduct {
  name: string;
  description?: string;
  price: number | '';
  currency: string;
  stock: number | '';
  category?: string;
  imageUrl?: string;
}

export interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: any | null;
}

const emptyDraft: DraftProduct = { name: '', price: '', currency: 'USD', stock: '' };

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ open, onClose, onSaved, editing }) => {
  const [draft, setDraft] = useState<DraftProduct>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editing) {
      setDraft({
        name: editing.name,
        description: editing.description,
        price: editing.price,
        currency: editing.currency,
        stock: editing.stock,
        category: editing.category,
        imageUrl: editing.imageUrl
      });
    } else {
      setDraft(emptyDraft);
    }
  }, [editing]);

  function handleChange<K extends keyof DraftProduct>(k: K, v: DraftProduct[K]) {
    setDraft(d => ({ ...d, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      const payload = serializeDraft(draft);
      const url = editing ? `/api/products/${editing.id}.json` : '/api/products.json';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Save failed');
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally { setSubmitting(false); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={submit} className="relative w-full max-w-lg bg-slate-900/90 border border-white/10 rounded-xl p-6 space-y-4 shadow-2xl animate-[fadeIn_.2s_ease]">
        <h2 className="text-lg font-semibold">{editing ? 'Edit Product' : 'Add Product'}</h2>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium mb-1">Name</label>
            <input required minLength={2} className="input" value={draft.name} onChange={e=>handleChange('name', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium mb-1">Description</label>
            <textarea className="input h-24" maxLength={500} value={draft.description||''} onChange={e=>handleChange('description', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Price</label>
            <input required type="number" step="0.01" className="input" value={draft.price} onChange={e=>handleChange('price', e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
            <div>
              <label className="block text-xs font-medium mb-1">Currency</label>
              <input required maxLength={3} className="input" value={draft.currency} onChange={e=>handleChange('currency', e.target.value.toUpperCase())} />
            </div>
          <div>
            <label className="block text-xs font-medium mb-1">Stock</label>
            <input type="number" className="input" value={draft.stock} onChange={e=>handleChange('stock', e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Category</label>
            <input className="input" value={draft.category||''} onChange={e=>handleChange('category', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium mb-1">Image URL</label>
            <input className="input" value={draft.imageUrl||''} onChange={e=>handleChange('imageUrl', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button disabled={submitting} className="btn-primary flex-1" type="submit">{submitting ? 'Saving...' : (editing ? 'Update Product' : 'Create Product')}</button>
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        </div>
      </form>
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

export default ProductFormModal;
