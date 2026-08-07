// src/app/api/cron/auto-generate/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { cronJob } from 'cron';
import { generateProduct } from '../../../lib/ai-generator';
import { AIRouterConfig } from '../../../types/index';
import { getAIModel } from '../../../lib/ai-router';

const prisma = new PrismaClient();

const autoGenerateRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const aiRouterConfig: AIRouterConfig = {
      model: 'groq',
      fallbackModel: 'gemini',
    };

    const aiModel = getAIModel(aiRouterConfig);

    const products = await prisma.product.findMany({
      where: {
        status: 'draft',
      },
    });

    if (products.length === 0) {
      const newProduct = await generateProduct(aiModel);
      await prisma.product.create({
        data: newProduct,
      });
    }

    res.status(200).json({ message: 'Auto generate route executed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error executing auto generate route' });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await autoGenerateRoute(req, res);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// Set up cron job to run every hour
cronJob('0 * * * *', async () => {
  await autoGenerateRoute(null, null);
});