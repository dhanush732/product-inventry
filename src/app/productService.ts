import { createProduct, updateProduct, ProductCreateSchema, ProductUpdateSchema, type ProductCreate, type ProductUpdate, type ProductId, type Product } from '@domain/product';
import { InMemoryProductRepository, type ProductRepository } from '@domain/productRepository';
import { NotFoundError, ValidationError } from '@domain/errors';
import { ZodError } from 'zod';

let repoSingleton: ProductRepository | null = null;
export function getProductRepository(): ProductRepository {
  if (!repoSingleton) repoSingleton = new InMemoryProductRepository();
  return repoSingleton;
}

export async function createNewProduct(input: ProductCreate): Promise<Product> {
  try {
    const entity = createProduct(ProductCreateSchema.parse(input));
    const repo = getProductRepository();
    await repo.add(entity);
    return entity;
  } catch (err) {
    if (err instanceof ZodError) throw new ValidationError('Invalid product data', err.issues);
    throw err;
  }
}

export async function updateExistingProduct(id: ProductId, patch: ProductUpdate): Promise<Product> {
  const repo = getProductRepository();
  const existing = await repo.get(id);
  if (!existing) throw new NotFoundError('Product not found');
  try {
    const parsed = ProductUpdateSchema.parse(patch);
    const updated = updateProduct(existing, parsed);
    await repo.update(updated);
    return updated;
  } catch (err) {
    if (err instanceof ZodError) throw new ValidationError('Invalid product update', err.issues);
    throw err;
  }
}

export async function deleteProduct(id: ProductId): Promise<void> {
  const repo = getProductRepository();
  const ok = await repo.delete(id);
  if (!ok) throw new NotFoundError('Product not found');
}

export async function getProduct(id: ProductId): Promise<Product> {
  const repo = getProductRepository();
  const product = await repo.get(id);
  if (!product) throw new NotFoundError('Product not found');
  return product;
}

export async function listProducts(): Promise<Product[]> {
  const repo = getProductRepository();
  return repo.list();
}
