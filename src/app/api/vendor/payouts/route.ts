// src/app/api/vendor/payouts/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { validateToken } from '../../../lib/security';
import { PayoutRequestStatus } from '../../../types/index';

const prisma = new PrismaClient();

interface PayoutRequest {
  id: number;
  vendorId: number;
  amount: number;
  status: PayoutRequestStatus;
  createdAt: Date;
}

const payoutRequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PAID: 'PAID',
};

async function getPayoutRequests(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decodedToken = validateToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const vendorId = decodedToken.vendorId;
    const payoutRequests = await prisma.payoutRequest.findMany({
      where: { vendorId },
      include: { vendor: true },
    });

    return res.status(200).json(payoutRequests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function createPayoutRequest(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decodedToken = validateToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const vendorId = decodedToken.vendorId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const payoutRequest = await prisma.payoutRequest.create({
      data: {
        vendorId,
        amount,
        status: payoutRequestStatus.PENDING,
      },
    });

    return res.status(201).json(payoutRequest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function updatePayoutRequest(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decodedToken = validateToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const vendorId = decodedToken.vendorId;
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const payoutRequest = await prisma.payoutRequest.findUnique({ where: { id } });
    if (!payoutRequest || payoutRequest.vendorId !== vendorId) {
      return res.status(404).json({ message: 'Payout request not found' });
    }

    const updatedPayoutRequest = await prisma.payoutRequest.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json(updatedPayoutRequest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getPayoutRequests(req, res);
    case 'POST':
      return createPayoutRequest(req, res);
    case 'PUT':
      return updatePayoutRequest(req, res);
    default:
      return res.status(405).json({ message: 'Method Not Allowed' });
  }
}