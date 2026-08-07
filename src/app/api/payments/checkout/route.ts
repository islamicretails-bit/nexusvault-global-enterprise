// src/app/api/payments/checkout/route.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { NextApiRequestWithUser } from '../lib/types';
import { getStripeSession } from '../lib/stripe';

const prisma = new PrismaClient();

const CheckoutRoute = async (req: NextApiRequestWithUser, res: NextApiResponse) => {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const product = await prisma.products.findUnique({
    where: { id: product_id },
  });

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const user = req.user;

  const stripeSession = await getStripeSession({
    product_id,
    quantity,
    user_id: user.id,
  });

  if (!stripeSession) {
    return res.status(500).json({ error: 'Failed to create Stripe session' });
  }

  return res.json({ stripeSession });
};

export default CheckoutRoute;

// src/app/api/payments/checkout/route.ts (Type Definition)
import type { NextApiRequest, NextApiResponse } from 'next';
import type { PrismaClient } from '@prisma/client';
import type { ZodError } from 'zod';

export type NextApiRequestWithUser = NextApiRequest & {
  user: {
    id: string;
  };
};

export type CheckoutRouteResponse = {
  stripeSession: {
    id: string;
  };
};

export type CheckoutRouteError = {
  error: string;
};

export type CheckoutRouteRequest = {
  product_id: string;
  quantity: number;
};

export type CheckoutRouteSchema = z.ZodObject<{
  product_id: z.ZodString;
  quantity: z.ZodNumber;
}>;

export type CheckoutRouteErrorSchema = z.ZodObject<{
  error: z.ZodString;
}>;

export type CheckoutRouteResponseSchema = z.ZodObject<{
  stripeSession: z.ZodObject<{
    id: z.ZodString;
  }>;
}>;

export const CheckoutRouteSchema = z.object({
  product_id: z.string(),
  quantity: z.number(),
});

export const CheckoutRouteErrorSchema = z.object({
  error: z.string(),
});

export const CheckoutRouteResponseSchema = z.object({
  stripeSession: z.object({
    id: z.string(),
  }),
});

// src/app/api/payments/checkout/route.ts (Schema Validation)
import { z } from 'zod';

const CheckoutRouteSchema = z.object({
  product_id: z.string(),
  quantity: z.number(),
});

const CheckoutRouteErrorSchema = z.object({
  error: z.string(),
});

const CheckoutRouteResponseSchema = z.object({
  stripeSession: z.object({
    id: z.string(),
  }),
});

export const validateCheckoutRequest = (req: NextApiRequest) => {
  try {
    const result = CheckoutRouteSchema.parse(req.body);
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues.map((issue) => issue.message).join(', ') };
    }
    throw error;
  }
};

export const validateCheckoutResponse = (res: NextApiResponse) => {
  try {
    const result = CheckoutRouteResponseSchema.parse(res.json);
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues.map((issue) => issue.message).join(', ') };
    }
    throw error;
  }
};