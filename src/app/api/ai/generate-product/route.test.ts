Here are some unit tests for the provided code using Jest and the `@prisma/client` library.

**src/lib/ai-generator.ts**
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateProduct(title: string, description: string, price: number, currency: string, category: string) {
  const product = await prisma.product.create({
    data: {
      title,
      description,
      price,
      currency,
      category
    }
  });

  return product;
}

export async function generateEbook(title: string, description: string, price: number, currency: string) {
  const ebook = await generateProduct(title, description, price, currency, 'ebook');

  return ebook;
}

export async function generateSourceCode(title: string, description: string, price: number, currency: string) {
  const sourceCode = await generateProduct(title, description, price, currency, 'source code');

  return sourceCode;
}

export async function generateAIPrompt(title: string, description: string, price: number, currency: string) {
  const aiPrompt = await generateProduct(title, description, price, currency, 'ai prompt');

  return aiPrompt;
}

**src/lib/ai-generator.test.ts**
import { generateProduct, generateEbook, generateSourceCode, generateAIPrompt } from './ai-generator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('generateProduct', () => {
  it('should create a new product', async () => {
    const product = await generateProduct('Test Product', 'Test Description', 10.99, 'USD', 'ebook');
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('title', 'Test Product');
    expect(product).toHaveProperty('description', 'Test Description');
    expect(product).toHaveProperty('price', 10.99);
    expect(product).toHaveProperty('currency', 'USD');
    expect(product).toHaveProperty('category', 'ebook');
  });
});

describe('generateEbook', () => {
  it('should create a new ebook', async () => {
    const ebook = await generateEbook('Test Ebook', 'Test Description', 10.99, 'USD');
    expect(ebook).toHaveProperty('id');
    expect(ebook).toHaveProperty('title', 'Test Ebook');
    expect(ebook).toHaveProperty('description', 'Test Description');
    expect(ebook).toHaveProperty('price', 10.99);
    expect(ebook).toHaveProperty('currency', 'USD');
    expect(ebook).toHaveProperty('category', 'ebook');
  });
});

describe('generateSourceCode', () => {
  it('should create a new source code', async () => {
    const sourceCode = await generateSourceCode('Test Source Code', 'Test Description', 10.99, 'USD');
    expect(sourceCode).toHaveProperty('id');
    expect(sourceCode).toHaveProperty('title', 'Test Source Code');
    expect(sourceCode).toHaveProperty('description', 'Test Description');
    expect(sourceCode).toHaveProperty('price', 10.99);
    expect(sourceCode).toHaveProperty('currency', 'USD');
    expect(sourceCode).toHaveProperty('category', 'source code');
  });
});

describe('generateAIPrompt', () => {
  it('should create a new ai prompt', async () => {
    const aiPrompt = await generateAIPrompt('Test AI Prompt', 'Test Description', 10.99, 'USD');
    expect(aiPrompt).toHaveProperty('id');
    expect(aiPrompt).toHaveProperty('title', 'Test AI Prompt');
    expect(aiPrompt).toHaveProperty('description', 'Test Description');
    expect(aiPrompt).toHaveProperty('price', 10.99);
    expect(aiPrompt).toHaveProperty('currency', 'USD');
    expect(aiPrompt).toHaveProperty('category', 'ai prompt');
  });
});

**src/lib/security.ts**
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateLicenseKey(product: any) {
  const licenseKey = await prisma.license.create({
    data: {
      product,
      licenseKey: crypto.randomUUID()
    }
  });

  return licenseKey;
}

export async function generatePreSignedDownloadLink(product: any) {
  const licenseKey = await generateLicenseKey(product);

  const downloadLink = await prisma.license.create({
    data: {
      product,
      licenseKey,
      downloadLink: await generatePreSignedUrl(product)
    }
  });

  return downloadLink;
}

export async function generatePreSignedUrl(product: any) {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: product.id
  };

  const data = await s3.getSignedUrlPromise('getObject', params);

  return data;
}

**src/lib/security.test.ts**
import { generateLicenseKey, generatePreSignedDownloadLink, generatePreSignedUrl } from './security';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';

jest.mock('aws-sdk');

describe('generateLicenseKey', () => {
  it('should create a new license key', async () => {
    const product = { id: uuidv4() };
    const licenseKey = await generateLicenseKey(product);
    expect(licenseKey).toHaveProperty('id');
    expect(licenseKey).toHaveProperty('product', product);
    expect(licenseKey).toHaveProperty('licenseKey', expect.any(String));
  });
});

describe('generatePreSignedDownloadLink', () => {
  it('should create a new pre signed download link', async () => {
    const product = { id: uuidv4() };
    const licenseKey = await generateLicenseKey(product);
    const downloadLink = await generatePreSignedDownloadLink(product);
    expect(downloadLink).toHaveProperty('id');
    expect(downloadLink).toHaveProperty('product', product);
    expect(downloadLink).toHaveProperty('licenseKey', licenseKey);
    expect(downloadLink).toHaveProperty('downloadLink', expect.any(String));
  });
});

describe('generatePreSignedUrl', () => {
  it('should create a new pre signed url', async () => {
    const product = { id: uuidv4() };
    const data = await generatePreSignedUrl(product);
    expect(data).toHaveProperty('SignedUrl', expect.any(String));
  });
});

Note: You need to install `jest` and `aws-sdk` packages to run these tests.

npm install --save-dev jest aws-sdk

Also, you need to configure `jest` to use the `@prisma/client` library.

npm install --save-dev @prisma/client

You can run the tests using the following command:

jest