import { describe, it, expect, beforeEach } from 'vitest';
import { getProductRepository } from '@app/productService';
import { POST as createHandler, GET as listHandler } from '../src/pages/api/products.json';
import { GET as getHandler, PATCH as patchHandler, DELETE as deleteHandler } from '../src/pages/api/products/[id].json';

function mockRequest(data?: any, method: string = 'GET') {
  return new Request('http://localhost/api/products.json', {
    method,
    body: data ? JSON.stringify(data) : undefined,
    headers: { 'Content-Type': 'application/json' }
  });
}

describe('product API integration', () => {
  beforeEach(async () => { await getProductRepository().clear(); });

  it('creates and lists', async () => {
    const res = await createHandler({ request: mockRequest({ name: 'X', price: 1, currency: 'USD', stock: 0 }) } as any);
    expect(res.status).toBe(201);
    const listRes = await listHandler({} as any);
    const items = await listRes.json();
    expect(items.length).toBe(1);
  });

  it('get/update/delete lifecycle', async () => {
    const createdRes = await createHandler({ request: mockRequest({ name: 'Y', price: 2, currency: 'USD', stock: 0 }, 'POST') } as any);
    const created = await createdRes.json();

    const getRes = await getHandler({ params: { id: created.id } } as any);
    expect(getRes.status).toBe(200);

    const patchRes = await patchHandler({ params: { id: created.id }, request: mockRequest({ price: 5 }, 'PATCH') } as any);
    expect(patchRes.status).toBe(200);

    const delRes = await deleteHandler({ params: { id: created.id } } as any);
    expect(delRes.status).toBe(204);
  });
});
