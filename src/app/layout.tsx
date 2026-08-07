### CONFIGURATION & DATABASE LAYER

#### 1. `prisma/schema.prisma`

// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String
  name     String
  role     String
  orders   Order[]
  licenses License[]
  customRequests CustomRequest[]
  autoPipelineLogs AutoPipelineLog[]
}

model Product {
  id         String   @id @default(cuid())
  name       String
  description String
  price      Decimal
  currency   String
  category   String
  vendor     String
  licenses   License[]
  orders     Order[]
}

model Order {
  id         String   @id @default(cuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  product    Product  @relation(fields: [productId], references: [id])
  productId  String
  license    License
  status     String
  createdAt  DateTime @default(now())
}

model License {
  id         String   @id @default(cuid())
  product    Product  @relation(fields: [productId], references: [id])
  productId  String
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  licenseKey String
  expiresAt  DateTime
}

model CustomRequest {
  id         String   @id @default(cuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  product    Product  @relation(fields: [productId], references: [id])
  productId  String
  description String
  price      Decimal
  currency   String
  status     String
  createdAt  DateTime @default(now())
}

model AutoPipelineLog {
  id         String   @id @default(cuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  status     String
  createdAt  DateTime @default(now())
}

#### 2. `package.json`

{
  "name": "nexavault",
  "version": "1.0.0",
  "scripts": {
    "dev": "next",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@prisma/client": "^4.10.0",
    "next": "^14.0.0",
    "prisma": "^4.10.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.0.11",
    "framer-motion": "^7.6.3",
    "lucide": "^3.0.0",
    "zod": "^3.13.0",
    "recharts": "^2.1.9",
    "jose": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@types/tailwindcss": "^3.0.0",
    "@types/framer-motion": "^7.0.0",
    "@types/lucide": "^3.0.0",
    "@types/zod": "^3.0.0",
    "@types/recharts": "^2.0.0",
    "@types/jose": "^4.0.0",
    "eslint": "^8.24.0",
    "eslint-plugin-next": "^13.0.0",
    "prettier": "^2.7.1"
  }
}

#### 3. `tailwind.config.js`

module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'glassmorphism': '#0B0F17',
        'glowing-border': '#FFFFFF10',
        'backdrop-blur': '#00000044'
      },
      keyframes: {
        'glowing-border': {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.5)' },
          '100%': { boxShadow: '0 0 0 10px rgba(255, 255, 255, 0.5)' }
        }
      },
      animation: {
        'glowing-border': 'glowing-border 2s infinite'
      }
    }
  },
  variants: {},
  plugins: [require('@tailwindcss/forms')]
}

#### 4. `src/app/globals.css`

@tailwind base;
@tailwind components;
@tailwind utilities;

.glowing-border {
  @apply border-2 border-white/10 rounded-md;
  animation: glowing-border 2s infinite;
}

.backdrop-blur {
  @apply backdrop-blur-2xl;
}

#### 5. `vercel.json`

{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "next"
    }
  ]
}

#### 6. `.env.example`

DATABASE_URL=postgres://user:password@localhost:5432/database
BARCLAYS_API_KEY=API_KEY
CITIBANK_API_KEY=API_KEY
JAZZCASH_API_KEY=API_KEY
EASYPAISA_API_KEY=API_KEY
ADMIN_OFFICE_PASSCODE=NexaVault2026Secret!
CRON_SECRET=SECRET

### AUTONOMOUS CONTENT ENGINE & UTILITIES

#### 1. `src/app/api/cron/auto-generate/route.ts`

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const trendSearch = await prisma.product.findMany({
      where: {
        category: 'trending'
      }
    });

    const products = await prisma.product.createMany({
      data: trendSearch.map((product) => ({
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        category: product.category,
        vendor: product.vendor
      }))
    });

    res.status(201).json({ message: 'Products generated successfully' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

#### 2. `src/lib/ai-generator.ts`

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateProduct(name: string, description: string, price: number, currency: string, category: string, vendor: string) {
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      currency,
      category,
      vendor
    }
  });

  return product;
}

#### 3. `src/lib/security.ts`

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateLicenseKey(productId: string, userId: string) {
  const license = await prisma.license.create({
    data: {
      productId,
      userId,
      licenseKey: generateRandomString(32),
      expiresAt: new Date(Date.now() + 86400000)
    }
  });

  return license;
}

function generateRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

#### 4. `src/lib/geo-currency.ts`

export function getCurrency(ipAddress: string) {
  const geoLocation = getGeoLocation(ipAddress);

  if (geoLocation.country === 'Pakistan') {
    return 'PKR';
  } else if (geoLocation.country === 'United States') {
    return 'USD';
  } else if (geoLocation.country === 'United Kingdom') {
    return 'GBP';
  } else {
    return 'USD';
  }
}

function getGeoLocation(ipAddress: string) {
  // Implement geo-location API call here
  return {
    country: 'Pakistan'
  };
}

#### 5. `src/types/index.ts`

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;