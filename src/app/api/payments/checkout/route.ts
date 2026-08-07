// src/app/api/payments/checkout/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { stripe } from 'src/lib/stripe';
import { paypal } from 'src/lib/paypal';
import { geoCurrency } from 'src/lib/geo-currency';
import { security } from 'src/lib/security';
import { notifications } from 'src/lib/notifications';

const prisma = new PrismaClient();

interface CheckoutRequest {
  userId: string;
  productId: string;
  quantity: number;
  paymentMethod: 'stripe' | 'paypal';
}

interface CheckoutResponse {
  success: boolean;
  message: string;
  orderId: string | null;
}

const checkoutRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, productId, quantity, paymentMethod } = req.body as CheckoutRequest;

  if (!userId || !productId || !quantity || !paymentMethod) {
    return res.status(400).json({ success: false, message: 'Invalid request body' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        productId,
        quantity,
        total: product.price * quantity,
      },
    });

    if (paymentMethod === 'stripe') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.total,
        currency: 'usd',
        payment_method_types: ['card'],
      });

      const paymentIntentId = paymentIntent.id;
      const clientSecret = paymentIntent.client_secret;

      return res.json({
        success: true,
        message: 'Checkout successful',
        orderId: order.id,
        paymentIntentId,
        clientSecret,
      });
    } else if (paymentMethod === 'paypal') {
      const paymentUrl = await paypal.createPaymentUrl({
        amount: order.total,
        currency: 'usd',
        return_url: `${req.headers.origin}/payment/success`,
        cancel_url: `${req.headers.origin}/payment/cancel`,
      });

      return res.json({
        success: true,
        message: 'Checkout successful',
        orderId: order.id,
        paymentUrl,
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default checkoutRoute;