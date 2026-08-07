// src/app/api/ai/generate-product/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { AIRouterConfig } from 'src/types/index';
import { aiGenerator } from 'src/lib/ai-generator';
import { aiRouter } from 'src/lib/ai-router';
import { security } from 'src/lib/security';

const prisma = new PrismaClient();

interface GenerateProductRequest {
  prompt: string;
  productType: string;
  userId: string;
}

const generateProductRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { prompt, productType, userId } = req.body as GenerateProductRequest;

    // Validate request
    if (!prompt || !productType || !userId) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Verify user token
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const verifiedToken = security.verifyToken(token);
    if (!verifiedToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate product using AI
    const aiConfig: AIRouterConfig = {
      prompt,
      productType,
      userId,
    };
    const generatedProduct = await aiGenerator.generateProduct(aiConfig);

    // Save generated product to database
    const product = await prisma.product.create({
      data: {
        title: generatedProduct.title,
        description: generatedProduct.description,
        price: generatedProduct.price,
        userId: userId,
      },
    });

    // Return generated product
    return res.status(201).json({ product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return generateProductRoute(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}