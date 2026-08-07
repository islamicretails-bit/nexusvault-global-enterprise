### src/app/api/admin/analytics/route.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getAnalyticsData } from 'src/lib/analytics';

const prisma = new PrismaClient();

const getAnalytics = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const schema = z.object({
      userId: z.string().optional(),
      productId: z.string().optional(),
      dateRange: z.string().optional(),
    });

    const params = schema.parse(req.query);

    const analyticsData = await getAnalyticsData(params);

    return res.status(200).json(analyticsData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getAnalytics(req, res);
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}

### src/lib/analytics.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAnalyticsData = async (params: {
  userId?: string;
  productId?: string;
  dateRange?: string;
}) => {
  const analyticsData = await prisma.analytics.findMany({
    where: {
      userId: params.userId,
      productId: params.productId,
      dateRange: params.dateRange,
    },
  });

  return analyticsData;
};

export { getAnalyticsData };

### src/types/analytics.ts

export interface Analytics {
  id: string;
  userId: string;
  productId: string;
  dateRange: string;
  views: number;
  downloads: number;
  revenue: number;
}

### src/app/api/admin/analytics/schema.graphql

type Analytics {
  id: ID!
  userId: String!
  productId: String!
  dateRange: String!
  views: Int!
  downloads: Int!
  revenue: Float!
}

type Query {
  getAnalytics(userId: String, productId: String, dateRange: String): [Analytics!]!
}

### src/app/api/admin/analytics/resolvers.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const resolvers = {
  Query: {
    getAnalytics: async (parent, { userId, productId, dateRange }) => {
      return prisma.analytics.findMany({
        where: {
          userId,
          productId,
          dateRange,
        },
      });
    },
  },
};

export default resolvers;