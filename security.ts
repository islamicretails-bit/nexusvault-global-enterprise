// src/lib/security.ts
import * as crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Define the security configuration interface
interface SecurityConfig {
  secretKey: string;
  rateLimitMax: number;
  rateLimitDuration: number;
}

// Define the security class
class Security {
  private secretKey: string;
  private rateLimiter: RateLimiterMemory;

  constructor(config: SecurityConfig) {
    this.secretKey = config.secretKey;
    this.rateLimiter = new RateLimiterMemory({
      points: config.rateLimitMax,
      duration: config.rateLimitDuration,
    });
  }

  // Method to verify a token
  async verifyToken(token: string): Promise<boolean> {
    try {
      const decoded = crypto.createHmac('sha256', this.secretKey).update(token).digest('hex');
      return decoded === token;
    } catch (error) {
      return false;
    }
  }

  // Method to create a SHA-256 HMAC signature
  createSignature(data: string): string {
    return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
  }

  // Method to rate limit a request
  async rateLimit(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
    try {
      const ip = req.ip;
      const rateLimitResult = await this.rateLimiter.consume(ip);
      if (rateLimitResult.remainingPoints < 1) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return false;
      }
      return true;
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
      return false;
    }
  }

  // Method to validate a payload
  validatePayload(payload: any): boolean {
    if (!payload || typeof payload !== 'object') {
      return false;
    }
    return true;
  }
}

// Export the security class
export default Security;

// src/types/index.ts
interface SecurityConfig {
  secretKey: string;
  rateLimitMax: number;
  rateLimitDuration: number;
}

interface User {
  id: string;
  email: string;
  password: string;
  role: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  total: number;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  total: number;
}

interface CustomRequest {
  id: string;
  userId: string;
  description: string;
  status: string;
}

interface AnalyticsLog {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
}

interface AffiliateReferral {
  id: string;
  userId: string;
  referralId: string;
  commission: number;
}

interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
}

interface PayoutRequest {
  id: string;
  userId: string;
  amount: number;
  status: string;
}

interface AIServiceLog {
  id: string;
  userId: string;
  service: string;
  timestamp: Date;
}

interface AIRouterConfig {
  groq: {
    apiKey: string;
    endpoint: string;
  };
  gemini: {
    apiKey: string;
    endpoint: string;
  };
  openai: {
    apiKey: string;
    endpoint: string;
  };
}

interface GeoLocation {
  ip: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

interface NotificationPayload {
  type: string;
  message: string;
  data: any;
}

interface DynamicFeatureMetadata {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export {
  SecurityConfig,
  User,
  Product,
  Order,
  OrderItem,
  CustomRequest,
  AnalyticsLog,
  AffiliateReferral,
  WalletTransaction,
  PayoutRequest,
  AIServiceLog,
  AIRouterConfig,
  GeoLocation,
  NotificationPayload,
  DynamicFeatureMetadata,
};

// src/app/api/middleware/security.ts
import Security from '../../lib/security';
import { NextApiRequest, NextApiResponse } from 'next';

const securityConfig: SecurityConfig = {
  secretKey: process.env.SECRET_KEY as string,
  rateLimitMax: 100,
  rateLimitDuration: 60,
};

const security = new Security(securityConfig);

export default async function securityMiddleware(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const isValid = await security.verifyToken(token);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const isRateLimited = await security.rateLimit(req, res);
    if (!isRateLimited) {
      return;
    }
    const isValidPayload = security.validatePayload(req.body);
    if (!isValidPayload) {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}