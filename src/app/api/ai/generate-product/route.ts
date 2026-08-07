// src/app/api/ai/generate-product/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { AIRouterConfig } from 'src/types/index';
import { aiGenerator } from 'src/lib/ai-generator';
import { aiRouter } from 'src/lib/ai-router';
import { security } from 'src/lib/security';

const prisma = new PrismaClient();

const generateProductRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Validate request
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, productType } = req.body;

    if (!prompt || !productType) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Verify token
    const token = req.headers['x-auth-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const verifiedToken = security.verifyToken(token as string);
    if (!verifiedToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Generate product
    const aiRouterConfig: AIRouterConfig = {
      model: 'product',
      prompt,
      productType,
    };

    const generatedProduct = await aiGenerator.generateProduct(aiRouterConfig);
    if (!generatedProduct) {
      return res.status(500).json({ error: 'Failed to generate product' });
    }

    // Save product to database
    const product = await prisma.product.create({
      data: {
        title: generatedProduct.title,
        description: generatedProduct.description,
        price: generatedProduct.price,
        productType,
      },
    });

    // Return generated product
    return res.status(201).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default generateProductRoute;