import type { APIRoute } from 'astro';
import { createNewProduct, listProducts } from '@app/productService';
import { ProductCreateSchema } from '@domain/product';
import { ValidationError } from '@domain/errors';
import { ZodError } from 'zod';

export const GET: APIRoute = async () => {
  const items = await listProducts();
  return new Response(JSON.stringify(items), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = ProductCreateSchema.parse(body);
    const created = await createNewProduct(parsed);
    return new Response(JSON.stringify(created), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    if (err instanceof ZodError) {
      return new Response(JSON.stringify({ error: 'ValidationError', issues: err.issues }), { status: 400 });
    }
    if (err instanceof ValidationError) {
      return new Response(JSON.stringify({ error: err.name, message: err.message, issues: err.issues }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: 'ServerError' }), { status: 500 });
  }
};
