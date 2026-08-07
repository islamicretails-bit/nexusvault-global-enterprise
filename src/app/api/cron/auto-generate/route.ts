// src/app/api/cron/auto-generate/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { cronJob } from 'cron';
import { generateProduct } from '../../../lib/ai-generator';
import { getAIRouterConfig } from '../../../lib/ai-router';
import { getGeoLocation } from '../../../lib/geo-currency';
import { sendNotification } from '../../../lib/notifications';
import { generateSEO } from '../../../lib/seo-generator';

const prisma = new PrismaClient();

interface AutoGenerateRequest extends NextApiRequest {
  body: {
    productId: string;
  };
}

interface AutoGenerateResponse extends NextApiResponse {
  status: number;
  message: string;
}

const autoGenerateRoute = async (req: AutoGenerateRequest, res: AutoGenerateResponse) => {
  try {
    const { productId } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const aiRouterConfig = await getAIRouterConfig();
    const geoLocation = await getGeoLocation(req.ip);
    const generatedProduct = await generateProduct(product, aiRouterConfig, geoLocation);

    if (generatedProduct) {
      await prisma.product.update({ where: { id: productId }, data: generatedProduct });
      await sendNotification('Product generated successfully', 'success');
      await generateSEO(generatedProduct);
      return res.status(200).json({ message: 'Product generated successfully' });
    } else {
      await sendNotification('Failed to generate product', 'error');
      return res.status(500).json({ message: 'Failed to generate product' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default async function handler(req: AutoGenerateRequest, res: AutoGenerateResponse) {
  if (req.method === 'POST') {
    return autoGenerateRoute(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Cron job to auto-generate products every hour
cronJob('0 * * * *', async () => {
  try {
    const products = await prisma.product.findMany();
    for (const product of products) {
      await autoGenerateRoute({ body: { productId: product.id } }, { status: 200, message: '' });
    }
  } catch (error) {
    console.error(error);
  }
});