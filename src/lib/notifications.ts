// src/lib/notifications.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from './email';
import { webhook } from './webhook';
import { NotificationPayload } from '../types/index';

interface NotificationConfig {
  email: {
    from: string;
    to: string;
    subject: string;
    body: string;
  };
  webhook: {
    url: string;
    method: string;
    headers: { [key: string]: string };
    body: string;
  };
}

const notificationConfig: NotificationConfig = {
  email: {
    from: 'your-email@example.com',
    to: 'recipient-email@example.com',
    subject: 'Notification from NexusVault Global Enterprise',
    body: 'This is a notification from NexusVault Global Enterprise',
  },
  webhook: {
    url: 'https://example.com/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Webhook notification from NexusVault Global Enterprise' }),
  },
};

async function sendNotification(payload: NotificationPayload) {
  try {
    // Send email notification
    await sendEmail({
      from: notificationConfig.email.from,
      to: notificationConfig.email.to,
      subject: notificationConfig.email.subject,
      body: notificationConfig.email.body,
    });

    // Send webhook notification
    await webhook({
      url: notificationConfig.webhook.url,
      method: notificationConfig.webhook.method,
      headers: notificationConfig.webhook.headers,
      body: notificationConfig.webhook.body,
    });

    return { success: true, message: 'Notification sent successfully' };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, message: 'Error sending notification' };
  }
}

export { sendNotification };

// src/lib/email.ts
import nodemailer from 'nodemailer';

async function sendEmail(options: {
  from: string;
  to: string;
  subject: string;
  body: string;
}) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false, // or 'STARTTLS'
    auth: {
      user: 'your-email@example.com',
      pass: 'your-password',
    },
  });

  const mailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    text: options.body,
  };

  await transporter.sendMail(mailOptions);
}

export { sendEmail };

// src/lib/webhook.ts
import axios from 'axios';

async function webhook(options: {
  url: string;
  method: string;
  headers: { [key: string]: string };
  body: string;
}) {
  const response = await axios({
    method: options.method,
    url: options.url,
    headers: options.headers,
    data: options.body,
  });

  if (response.status !== 200) {
    throw new Error(`Webhook failed with status code ${response.status}`);
  }
}

export { webhook };