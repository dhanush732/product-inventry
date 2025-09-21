import type { Product, ProductId } from './product';

export interface ProductRepository {
  add(product: Product): Promise<void>;
  get(id: ProductId): Promise<Product | undefined>;
  update(product: Product): Promise<void>;
  delete(id: ProductId): Promise<boolean>;
  list(): Promise<Product[]>;
  clear(): Promise<void>;
}

export class InMemoryProductRepository implements ProductRepository {
  private items = new Map<ProductId, Product>();
  async add(product: Product) { this.items.set(product.id, product); }
  async get(id: ProductId) { return this.items.get(id); }
  async update(product: Product) { this.items.set(product.id, product); }
  async delete(id: ProductId) { return this.items.delete(id); }
  async list() { return [...this.items.values()].sort((a,b)=> a.createdAt.getTime()-b.createdAt.getTime()); }
  async clear() { this.items.clear(); }
}
