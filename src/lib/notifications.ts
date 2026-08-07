// src/lib/notifications.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from './email';
import { sendWebhook } from './webhook';
import { NotificationPayload } from '../types/index';

interface NotificationConfig {
  email: {
    enabled: boolean;
    from: string;
    to: string;
  };
  webhook: {
    enabled: boolean;
    url: string;
  };
}

const notificationConfig: NotificationConfig = {
  email: {
    enabled: true,
    from: 'no-reply@example.com',
    to: 'admin@example.com',
  },
  webhook: {
    enabled: true,
    url: 'https://example.com/webhook',
  },
};

const sendNotification = async (payload: NotificationPayload) => {
  if (notificationConfig.email.enabled) {
    await sendEmail(payload);
  }

  if (notificationConfig.webhook.enabled) {
    await sendWebhook(payload);
  }
};

const sendEmail = async (payload: NotificationPayload) => {
  const { subject, body } = payload;
  const mailOptions = {
    from: notificationConfig.email.from,
    to: notificationConfig.email.to,
    subject,
    text: body,
  };

  // Use a email service like Nodemailer or Sendgrid to send the email
  // For example:
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({
  //   host: 'smtp.example.com',
  //   port: 587,
  //   secure: false, // or 'STARTTLS'
  //   auth: {
  //     user: 'username',
  //     pass: 'password',
  //   },
  // });
  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log('Email sent: ' + info.response);
  //   }
  // });
};

const sendWebhook = async (payload: NotificationPayload) => {
  const { event, data } = payload;
  const webhookUrl = notificationConfig.webhook.url;

  // Use a HTTP client like Axios to send the webhook request
  // For example:
  // const axios = require('axios');
  // axios.post(webhookUrl, {
  //   event,
  //   data,
  // })
  // .then((response) => {
  //   console.log(response.data);
  // })
  // .catch((error) => {
  //   console.log(error);
  // });
};

export { sendNotification };

// src/types/index.ts
interface NotificationPayload {
  subject: string;
  body: string;
  event?: string;
  data?: any;
}

export { NotificationPayload };

// src/lib/email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

const sendEmail = async (payload: NotificationPayload) => {
  const { subject, body } = payload;
  const mailOptions = {
    from: 'no-reply@example.com',
    to: 'admin@example.com',
    subject,
    text: body,
  };

  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false, // or 'STARTTLS'
    auth: {
      user: 'username',
      pass: 'password',
    },
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

export { sendEmail };

// src/lib/webhook.ts
import axios from 'axios';

const sendWebhook = async (payload: NotificationPayload) => {
  const { event, data } = payload;
  const webhookUrl = 'https://example.com/webhook';

  axios.post(webhookUrl, {
    event,
    data,
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error);
  });
};

export { sendWebhook };