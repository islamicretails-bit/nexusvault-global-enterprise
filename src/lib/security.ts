**src/lib/security.ts**
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import * as jose from 'jose';
import * as crypto from 'crypto';
import { AES } from 'crypto-js';

const prisma = new PrismaClient();

export async function generateLicenseKey(productId: string, userId: string): Promise<string> {
  const licenseKey = uuidv4();
  await prisma.licenses.create({
    data: {
      productId,
      userId,
      licenseKey,
    },
  });
  return licenseKey;
}

export async function generateDownloadLink(productId: string, licenseKey: string): Promise<string> {
  const encryptedLink = AES.encrypt(productId, licenseKey).toString();
  const signedLink = await signDownloadLink(encryptedLink);
  return signedLink;
}

export async function signDownloadLink(encryptedLink: string): Promise<string> {
  const secretKey = process.env.SECRET_KEY;
  const token = await jose.jwt.sign({ encryptedLink }, secretKey, {
    algorithm: 'HS256',
  });
  return token;
}

export async function verifyDownloadLink(token: string): Promise<string> {
  const secretKey = process.env.SECRET_KEY;
  try {
    const payload = await jose.jwt.verify(token, secretKey);
    return payload.encryptedLink;
  } catch (error) {
    throw new Error('Invalid download link');
  }
}

export async function decryptDownloadLink(encryptedLink: string, licenseKey: string): Promise<string> {
  const decryptedLink = AES.decrypt(encryptedLink, licenseKey).toString(AES.decrypt);
  return decryptedLink;
}

export async function generateFingerprint(productId: string): Promise<string> {
  const hash = crypto.createHash('sha256');
  hash.update(productId);
  return hash.digest('hex');
}

export async function generateWatermark(productId: string): Promise<string> {
  const hash = crypto.createHash('sha256');
  hash.update(productId);
  return hash.digest('hex');
}