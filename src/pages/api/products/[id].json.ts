import type { APIRoute } from 'astro';
import { getProduct, updateExistingProduct, deleteProduct } from '@app/productService';
import { ProductUpdateSchema } from '@domain/product';
import { NotFoundError } from '@domain/errors';
import { ZodError } from 'zod';

export const GET: APIRoute = async ({ params }) => {
  try {
    const product = await getProduct(params.id!);
    return new Response(JSON.stringify(product), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    if (err instanceof NotFoundError) return new Response(JSON.stringify({ error: 'NotFound' }), { status: 404 });
    return new Response(JSON.stringify({ error: 'ServerError' }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();
    const patch = ProductUpdateSchema.parse(body);
    const updated = await updateExistingProduct(params.id!, patch);
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    if (err instanceof NotFoundError) return new Response(JSON.stringify({ error: 'NotFound' }), { status: 404 });
    if (err instanceof ZodError) return new Response(JSON.stringify({ error: 'ValidationError', issues: err.issues }), { status: 400 });
    return new Response(JSON.stringify({ error: 'ServerError' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    await deleteProduct(params.id!);
    return new Response(null, { status: 204 });
  } catch (err) {
    if (err instanceof NotFoundError) return new Response(JSON.stringify({ error: 'NotFound' }), { status: 404 });
    return new Response(JSON.stringify({ error: 'ServerError' }), { status: 500 });
  }
};
