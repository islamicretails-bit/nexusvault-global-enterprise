**CONFIGURATION & DATABASE LAYER**

### 1. `prisma/schema.prisma`

model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String
  name     String
  role     String
  orders   Order[]
  licenses License[]
}

model Product {
  id       String   @id @default(cuid())
  title    String
  description String
  price    Decimal
  currency String
  vendor   Vendor
  orders   Order[]
}

model Order {
  id       String   @id @default(cuid())
  userId   String
  productId String
  license  License
  user     User     @relation(fields: [userId], references: [id])
  product  Product  @relation(fields: [productId], references: [id])
}

model License {
  id       String   @id @default(cuid())
  orderId  String
  userId   String
  productId String
  user     User     @relation(fields: [userId], references: [id])
  product  Product  @relation(fields: [productId], references: [id])
  order    Order    @relation(fields: [orderId], references: [id])
}

model Affiliate {
  id       String   @id @default(cuid())
  email    String   @unique
  name     String
  commission Decimal
  referrals Referral[]
}

model Referral {
  id       String   @id @default(cuid())
  affiliateId String
  userId    String
  productId String
  affiliate Affiliate @relation(fields: [affiliateId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])
}

model Vendor {
  id       String   @id @default(cuid())
  name     String
  email    String   @unique
  products Product[]
}

model CustomRequest {
  id       String   @id @default(cuid())
  userId   String
  productId String
  user     User     @relation(fields: [userId], references: [id])
  product  Product  @relation(fields: [productId], references: [id])
}

model AutoPipelineLog {
  id       String   @id @default(cuid())
  timestamp DateTime
  message   String
}

### 2. `package.json`

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
    "framer-motion": "^7.6.5",
    "lucide": "^3.3.0",
    "next": "^14.0.0",
    "prisma": "^4.10.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-icons": "^4.3.1",
    "tailwindcss": "^3.2.4",
    "zod": "^3.17.0"
  },
  "devDependencies": {
    "@types/framer-motion": "^7.6.5",
    "@types/lucide": "^3.3.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@types/tailwindcss": "^3.2.4",
    "autoprefixer": "^10.4.8",
    "postcss": "^8.4.14",
    "postcss-import": "^14.0.1",
    "postcss-nested": "^5.0.6",
    "postcss-preset-env": "^8.5.0",
    "tailwindcss": "^3.2.4",
    "typescript": "^4.7.4"
  }
}

### 3. `tailwind.config.js`

module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'glassmorphism': '#0B0F17',
        'glowing-border': '#FFFFFF10'
      },
      keyframes: {
        'animate-scale': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.02)' }
        }
      },
      animation: {
        'animate-scale': 'animate-scale 0.5s ease-in-out infinite'
      }
    }
  },
  variants: {},
  plugins: [require('@tailwindcss/forms')]
}

### 4. `src/app/globals.css`

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-900;
  @apply text-white;
}

.glassmorphism {
  @apply bg-gray-900;
  @apply rounded-lg;
  @apply p-4;
  @apply shadow-md;
  @apply backdrop-blur-2xl;
}

.glowing-border {
  @apply border-white/10;
  @apply rounded-lg;
}

### 5. `vercel.json`

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
      "dest": "next/static/build/_next/api/$1"
    },
    {
      "src": "/_next/(.*)",
      "dest": "next/static/build/_next/$1"
    },
    {
      "src": "/static/(.*)",
      "dest": "next/static/build/static/$1"
    }
  ]
}

### 6. `.env.example`

ADMIN_OFFICE_PASSCODE=NexaVault2026Secret!
CRON_SECRET=your-cron-secret-key
BARCLAYS_API_KEY=your-barclays-api-key
CITIBANK_API_KEY=your-citibank-api-key
JAZZCASH_API_KEY=your-jazzcash-api-key
EASYPAISA_API_KEY=your-easypaisa-api-key

**AUTONOMOUS CONTENT ENGINE & UTILITIES**

### 7. `src/app/api/cron/auto-generate/route.ts`

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { searchQuery } = req.body;
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: searchQuery
        }
      }
    });
    res.json(products);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

### 8. `src/lib/ai-generator.ts`

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateProduct(title: string, description: string, price: number, currency: string) {
  const product = await prisma.product.create({
    data: {
      title,
      description,
      price,
      currency
    }
  });
  return product;
}

### 9. `src/lib/security.ts`

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateLicenseKey(orderId: string) {
  const licenseKey = await prisma.license.create({
    data: {
      orderId
    }
  });
  return licenseKey;
}

export async function generateDownloadLink(licenseKey: string) {
  const downloadLink = await prisma.license.update({
    where: {
      id: licenseKey
    },
    data: {
      downloadLink: `https://example.com/download/${licenseKey}`
    }
  });
  return downloadLink.downloadLink;
}

### 10. `src/lib/geo-currency.ts`

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getCurrency(req: NextApiRequest, res: NextApiResponse) {
  const { ip } = req.headers;
  const country = await prisma.country.findFirst({
    where: {
      ip
    }
  });
  const currency = country.currency;
  res.json({ currency });
}

### 11. `src/types/index.ts`

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
}

export interface License {
  id: string;
  orderId: string;
  downloadLink: string;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  license: License;
}

**HIDDEN ADMIN OFFICE (`/office`)**

### 12. `src/app/office/page.tsx`

import { NextPage } from 'next';
import { useState } from 'react