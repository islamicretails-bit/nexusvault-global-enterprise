// src/types/index.ts

// Import required types
import { Prisma } from '@prisma/client';

// User Interface
export interface User {
  id: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'VENDOR' | 'CUSTOMER' | 'AFFILIATE';
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product Interface
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Order Interface
export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  total: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

// OrderItem Interface
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// CustomRequest Interface
export interface CustomRequest {
  id: string;
  userId: string;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

// AnalyticsLog Interface
export interface AnalyticsLog {
  id: string;
  userId: string;
  eventType: string;
  eventData: string;
  createdAt: Date;
  updatedAt: Date;
}

// AffiliateReferral Interface
export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  referralId: string;
  commission: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

// WalletTransaction Interface
export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

// PayoutRequest Interface
export interface PayoutRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

// AIServiceLog Interface
export interface AIServiceLog {
  id: string;
  userId: string;
  aiService: string;
  input: string;
  output: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

// AIRouterConfig Interface
export interface AIRouterConfig {
  groqApiKey: string;
  geminiApiKey: string;
  openaiApiKey: string;
  fallbackTimeout: number;
}

// GeoLocation Interface
export interface GeoLocation {
  ip: string;
  country: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
}

// NotificationPayload Interface
export interface NotificationPayload {
  userId: string;
  eventType: string;
  eventData: string;
}

// DynamicFeatureMetadata Interface
export interface DynamicFeatureMetadata {
  id: string;
  featureName: string;
  description: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

// Prisma Client
export type PrismaClient = Prisma.Client;

// Prisma Model Types
export type PrismaModelTypes = {
  User: User;
  Product: Product;
  Order: Order;
  OrderItem: OrderItem;
  CustomRequest: CustomRequest;
  AnalyticsLog: AnalyticsLog;
  AffiliateReferral: AffiliateReferral;
  WalletTransaction: WalletTransaction;
  PayoutRequest: PayoutRequest;
  AIServiceLog: AIServiceLog;
};