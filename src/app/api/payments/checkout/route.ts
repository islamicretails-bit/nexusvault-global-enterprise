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
  transactionId: string | null;
}

const checkoutRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, productId, quantity, paymentMethod } = req.body as CheckoutRequest;

  if (!userId || !productId || !quantity || !paymentMethod) {
    return res.status(400).json({ success: false, message: 'Invalid request' });
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

    const geoLocation = await geoCurrency.getGeoLocation(user.ipAddress);
    const exchangeRate = await geoCurrency.getExchangeRate(geoLocation.countryCode);

    const totalPrice = product.price * quantity * exchangeRate;

    let transactionId: string | null = null;

    if (paymentMethod === 'stripe') {
      const stripeCustomer = await stripe.createCustomer(user.email, user.name);
      const stripePaymentIntent = await stripe.createPaymentIntent(stripeCustomer.id, totalPrice);
      const stripePaymentMethod = await stripe.createPaymentMethod(stripePaymentIntent.id, user.cardNumber, user.expMonth, user.expYear);
      const stripeCharge = await stripe.createCharge(stripePaymentMethod.id, totalPrice);
      transactionId = stripeCharge.id;
    } else if (paymentMethod === 'paypal') {
      const paypalPayment = await paypal.createPayment(totalPrice, user.email);
      const paypalPaymentExecution = await paypal.executePayment(paypalPayment.id);
      transactionId = paypalPaymentExecution.id;
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        quantity: quantity,
        totalPrice: totalPrice,
        transactionId: transactionId,
      },
    });

    await notifications.sendOrderConfirmationEmail(user.email, order.id);

    return res.status(201).json({ success: true, message: 'Checkout successful', transactionId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default checkoutRoute;