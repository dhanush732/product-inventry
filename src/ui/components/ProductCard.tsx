import React from 'react';

export interface ProductCardProps {
  product: any;
  onEdit: (p: any) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, onOpen }) => {
  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col shadow hover:shadow-lg transition">
      {product.imageUrl ? (
        <div className="aspect-[4/3] overflow-hidden">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
        </div>
      ) : (
        <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-slate-700/40 to-slate-800/60 text-slate-400 text-xs">NO IMAGE</div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 cursor-pointer hover:text-primary-400" onClick={() => onOpen(product.id)}>{product.name}</h3>
          <span className="text-primary-300 font-semibold text-sm whitespace-nowrap">{product.currency} {Number(product.price).toFixed(2)}</span>
        </div>
        <p className="text-xs text-slate-400 line-clamp-3 mb-3 min-h-[3rem]">{product.description || 'No description provided.'}</p>
        <div className="mt-auto flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-500">
          <span>Stock: {product.stock}</span>
          {product.category && <span className="px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-300 text-[10px] font-medium">{product.category}</span>}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition flex gap-2 mt-3">
          <button onClick={()=>onEdit(product)} className="flex-1 h-8 rounded bg-primary-500/90 hover:bg-primary-400 text-xs font-medium">Edit</button>
          <button onClick={()=>onDelete(product.id)} className="flex-1 h-8 rounded bg-red-500/80 hover:bg-red-500 text-xs font-medium">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
