import { z } from 'zod';
import { nanoid } from 'nanoid';

export const ProductIdSchema = z.string().min(1);
export type ProductId = z.infer<typeof ProductIdSchema>;

export const ProductCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional().default(''),
  price: z.number().nonnegative().finite(),
  currency: z.string().length(3).default('USD'),
  stock: z.number().int().nonnegative().default(0),
  category: z.string().max(50).optional(),
  imageUrl: z.string().url().optional()
});
export type ProductCreate = z.infer<typeof ProductCreateSchema>;

export const ProductUpdateSchema = ProductCreateSchema.partial();
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;

export const ProductSchema = ProductCreateSchema.extend({
  id: ProductIdSchema,
  createdAt: z.date(),
  updatedAt: z.date()
});
export type Product = z.infer<typeof ProductSchema>;

export function createProduct(data: ProductCreate): Product {
  const parsed = ProductCreateSchema.parse(data);
  const now = new Date();
  return { id: nanoid(12), createdAt: now, updatedAt: now, ...parsed };
}

export function updateProduct(existing: Product, patch: ProductUpdate): Product {
  const parsed = ProductUpdateSchema.parse(patch);
  const merged: Product = { ...existing, ...parsed, updatedAt: new Date() };
  return ProductSchema.parse(merged);
}
