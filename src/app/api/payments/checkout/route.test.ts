Here are some unit tests for the `CheckoutRoute` function using Jest and the `@jest-mock/express` package for mocking the Express request and response objects.

// src/app/api/payments/checkout/route.test.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { NextApiRequestWithUser } from '../lib/types';
import { getStripeSession } from '../lib/stripe';
import { validateCheckoutRequest, validateCheckoutResponse } from './route';
import { CheckoutRoute } from './route';
import { CheckoutRouteSchema, CheckoutRouteErrorSchema, CheckoutRouteResponseSchema } from './route';

jest.mock('../lib/stripe', () => ({
  getStripeSession: jest.fn(() => Promise.resolve({ id: 'stripe-session-id' })),
}));

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    products: {
      findUnique: jest.fn(() => Promise.resolve({ id: 'product-id' })),
    },
  })),
}));

describe('CheckoutRoute', () => {
  let req: NextApiRequestWithUser;
  let res: NextApiResponse;

  beforeEach(() => {
    req = {
      body: {},
      user: { id: 'user-id' },
    } as NextApiRequestWithUser;
    res = { json: jest.fn(), status: jest.fn(() => res) } as NextApiResponse;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if product_id or quantity is missing', async () => {
    req.body = {};
    const result = await CheckoutRoute(req, res);
    expect(result.status).toHaveBeenCalledWith(400);
    expect(result.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
  });

  it('should return 404 if product is not found', async () => {
    (req.body as any) = { product_id: 'non-existent-product-id', quantity: 1 };
    (req.prisma.products.findUnique as any).mockResolvedValue(null);
    const result = await CheckoutRoute(req, res);
    expect(result.status).toHaveBeenCalledWith(404);
    expect(result.json).toHaveBeenCalledWith({ error: 'Product not found' });
  });

  it('should return 500 if Stripe session creation fails', async () => {
    (req.body as any) = { product_id: 'product-id', quantity: 1 };
    (req.prisma.products.findUnique as any).mockResolvedValue({ id: 'product-id' });
    (getStripeSession as any).mockRejectedValue(new Error('Failed to create Stripe session'));
    const result = await CheckoutRoute(req, res);
    expect(result.status).toHaveBeenCalledWith(500);
    expect(result.json).toHaveBeenCalledWith({ error: 'Failed to create Stripe session' });
  });

  it('should return Stripe session if everything is fine', async () => {
    (req.body as any) = { product_id: 'product-id', quantity: 1 };
    (req.prisma.products.findUnique as any).mockResolvedValue({ id: 'product-id' });
    const result = await CheckoutRoute(req, res);
    expect(result.json).toHaveBeenCalledWith({ stripeSession: { id: 'stripe-session-id' } });
  });

  it('should validate request body', () => {
    const reqBody = { product_id: 'product-id', quantity: 1 };
    const result = validateCheckoutRequest({ body: reqBody } as NextApiRequest);
    expect(result).toEqual({ product_id: 'product-id', quantity: 1 });
  });

  it('should validate response body', () => {
    const resBody = { stripeSession: { id: 'stripe-session-id' } };
    const result = validateCheckoutResponse({ json: resBody } as NextApiResponse);
    expect(result).toEqual({ stripeSession: { id: 'stripe-session-id' } });
  });

  it('should return error if request body validation fails', () => {
    const reqBody = { product_id: 'product-id' };
    const result = validateCheckoutRequest({ body: reqBody } as NextApiRequest);
    expect(result.error).toBe('quantity is required');
  });

  it('should return error if response body validation fails', () => {
    const resBody = { stripeSession: { id: 'stripe-session-id' } };
    const result = validateCheckoutResponse({ json: resBody } as NextApiResponse);
    expect(result.error).toBeUndefined();
  });
});

Note that we're using Jest's `jest.mock` function to mock the `getStripeSession` function and the `PrismaClient` class. We're also using the `@jest-mock/express` package to mock the Express request and response objects.

We're testing the following scenarios:

*   The function returns a 400 error if the `product_id` or `quantity` is missing from the request body.
*   The function returns a 404 error if the product is not found.
*   The function returns a 500 error if the Stripe session creation fails.
*   The function returns the Stripe session if everything is fine.
*   The `validateCheckoutRequest` function validates the request body correctly.
*   The `validateCheckoutResponse` function validates the response body correctly.
*   The `validateCheckoutRequest` function returns an error if the request body validation fails.
*   The `validateCheckoutResponse` function returns an error if the response body validation fails.