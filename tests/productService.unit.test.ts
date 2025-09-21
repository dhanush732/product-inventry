import { describe, it, expect, beforeEach } from 'vitest';
import { createNewProduct, listProducts, updateExistingProduct, deleteProduct, getProduct } from '@app/productService';
import { getProductRepository } from '@app/productService';

describe('productService unit', () => {
  beforeEach(async () => {
    await getProductRepository().clear();
  });

  it('creates product', async () => {
    const p = await createNewProduct({ name: 'Test', price: 10, currency: 'USD', stock: 5 });
    expect(p.id).toBeDefined();
    const list = await listProducts();
    expect(list.length).toBe(1);
  });

  it('updates product', async () => {
    const p = await createNewProduct({ name: 'T1', price: 5, currency: 'USD', stock: 0 });
    const updated = await updateExistingProduct(p.id, { price: 9.5 });
    expect(updated.price).toBe(9.5);
  });

  it('deletes product', async () => {
    const p = await createNewProduct({ name: 'T2', price: 1, currency: 'USD', stock: 0 });
    await deleteProduct(p.id);
    await expect(getProduct(p.id)).rejects.toThrow();
  });
});
