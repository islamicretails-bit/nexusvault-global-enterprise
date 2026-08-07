// src/app/api/webhooks/paypal/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import { PayPalWebhookEvent } from 'paypal-rest-sdk';
import { PrismaClient } from '@prisma/client';
import { PayPalWebhookSecret } from '../lib/security';
import { sendNotification } from '../lib/notifications';

const prisma = new PrismaClient();

interface PayPalWebhookRequest extends NextApiRequest {
  body: PayPalWebhookEvent;
}

const paypalWebhookRoute = async (req: PayPalWebhookRequest, res: NextApiResponse) => {
  try {
    const { headers, body } = req;

    // Verify PayPal webhook signature
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const webhookSecret = process.env.PAYPAL_WEBHOOK_SECRET;
    const verification = verify(body, webhookSecret, { algorithms: ['HS256'] });

    if (!verification) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Process PayPal webhook event
    const eventType = body.event_type;
    const eventId = body.id;

    switch (eventType) {
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentSaleCompleted(body);
        break;
      case 'PAYMENT.SALE.DENIED':
        await handlePaymentSaleDenied(body);
        break;
      case 'PAYMENT.SALE.PENDING':
        await handlePaymentSalePending(body);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return res.status(200).json({ message: 'Webhook event processed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handlePaymentSaleCompleted = async (event: PayPalWebhookEvent) => {
  try {
    const paymentId = event.resource.id;
    const paymentAmount = event.resource.amount.total;
    const paymentCurrency = event.resource.amount.currency;

    // Update order status to paid
    const order = await prisma.order.findFirst({
      where: {
        paymentId,
      },
    });

    if (order) {
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: 'PAID',
        },
      });

      // Send notification to vendor and customer
      await sendNotification({
        type: 'PAYMENT_SALE_COMPLETED',
        recipient: order.vendorId,
        data: {
          orderId: order.id,
          paymentAmount,
          paymentCurrency,
        },
      });

      await sendNotification({
        type: 'PAYMENT_SALE_COMPLETED',
        recipient: order.customerId,
        data: {
          orderId: order.id,
          paymentAmount,
          paymentCurrency,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const handlePaymentSaleDenied = async (event: PayPalWebhookEvent) => {
  try {
    const paymentId = event.resource.id;
    const paymentAmount = event.resource.amount.total;
    const paymentCurrency = event.resource.amount.currency;

    // Update order status to denied
    const order = await prisma.order.findFirst({
      where: {
        paymentId,
      },
    });

    if (order) {
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: 'DENIED',
        },
      });

      // Send notification to vendor and customer
      await sendNotification({
        type: 'PAYMENT_SALE_DENIED',
        recipient: order.vendorId,
        data: {
          orderId: order.id,
          paymentAmount,
          paymentCurrency,
        },
      });

      await sendNotification({
        type: 'PAYMENT_SALE_DENIED',
        recipient: order.customerId,
        data: {
          orderId: order.id,
          paymentAmount,
          paymentCurrency,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const handlePaymentSalePending = async (event: PayPalWebhookEvent) => {
  try {
    const paymentId = event.resource.id;
    const paymentAmount = event.resource.amount.total;
    const paymentCurrency = event.resource.amount.currency;

    // Update order status to pending
    const order = await prisma.order.findFirst({
      where: {
        paymentId,
      },
    });

    if (order) {
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: 'PENDING',
        },
      });

      // Send notification to vendor and customer
      await sendNotification({
        type: 'PAYMENT_SALE_PENDING',
        recipient: order.vendorId,
        data: {
          orderId: order.id,
          paymentAmount,
          paymentCurrency,
        },
      });

      await sendNotification({
        type: 'PAYMENT_SALE_PENDING',
        recipient: order.customerId,
        data: {
          orderId: order.id,
          paymentAmount,
          paymentCurrency,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export default paypalWebhookRoute;