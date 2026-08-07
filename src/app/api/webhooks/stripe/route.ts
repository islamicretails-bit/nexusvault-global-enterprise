// src/app/api/webhooks/stripe/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from 'src/lib/stripe';
import { verifyRequest } from 'src/lib/security';
import { NotificationPayload } from 'src/types/index';
import { sendNotification } from 'src/lib/notifications';

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handleStripeWebhook = async (req: NextApiRequest, res: NextApiResponse) => {
  const signature = req.headers['stripe-signature'];
  const event = req.body;

  try {
    const verifiedEvent = stripe.webhooks.constructEvent(
      event,
      signature,
      stripeWebhookSecret
    );

    switch (verifiedEvent.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = verifiedEvent.data.object;
        const notificationPayload: NotificationPayload = {
          type: 'payment_intent.succeeded',
          data: paymentIntent,
        };
        await sendNotification(notificationPayload);
        break;
      case 'payment_intent.failed':
        const failedPaymentIntent = verifiedEvent.data.object;
        const failedNotificationPayload: NotificationPayload = {
          type: 'payment_intent.failed',
          data: failedPaymentIntent,
        };
        await sendNotification(failedNotificationPayload);
        break;
      case 'invoice.payment_succeeded':
        const invoice = verifiedEvent.data.object;
        const invoiceNotificationPayload: NotificationPayload = {
          type: 'invoice.payment_succeeded',
          data: invoice,
        };
        await sendNotification(invoiceNotificationPayload);
        break;
      case 'invoice.payment_failed':
        const failedInvoice = verifiedEvent.data.object;
        const failedInvoiceNotificationPayload: NotificationPayload = {
          type: 'invoice.payment_failed',
          data: failedInvoice,
        };
        await sendNotification(failedInvoiceNotificationPayload);
        break;
      default:
        console.log(`Unhandled event type: ${verifiedEvent.type}`);
    }

    res.status(200).send({ received: true });
  } catch (err) {
    console.error(err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Method Not Allowed' });
  }

  try {
    await verifyRequest(req);
  } catch (err) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  await handleStripeWebhook(req, res);
}