// src/components/marketplace/ProductCard.ts
import React from 'react';
import { Product } from '../types';
import { useCurrency } from '../lib/geo-currency';
import { Link } from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { currency, convertPrice } = useCurrency();

  return (
    <div className="bg-gray-100 rounded-lg shadow-md p-4">
      <Link href={`/products/${product.id}`}>
        <a>
          <Image
            src={product.image}
            alt={product.name}
            width={200}
            height={200}
            className="rounded-lg"
          />
        </a>
      </Link>
      <h2 className="text-lg font-bold mt-2">
        <Link href={`/products/${product.id}`}>
          <a>{product.name}</a>
        </Link>
      </h2>
      <p className="text-gray-600 text-sm mt-1">{product.description}</p>
      <div className="flex justify-between items-center mt-4">
        <span className="text-lg font-bold">
          {convertPrice(product.price, currency)}
        </span>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

// src/types/index.ts
interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Order {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  total: number;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
}

interface CustomRequest {
  id: number;
  userId: number;
  description: string;
}

interface AnalyticsLog {
  id: number;
  userId: number;
  eventType: string;
  eventData: string;
}

interface AffiliateReferral {
  id: number;
  userId: number;
  referralId: number;
}

interface WalletTransaction {
  id: number;
  userId: number;
  amount: number;
  type: string;
}

interface PayoutRequest {
  id: number;
  userId: number;
  amount: number;
}

interface AIServiceLog {
  id: number;
  userId: number;
  service: string;
  log: string;
}

interface AIRouterConfig {
  id: number;
  userId: number;
  config: string;
}

interface GeoLocation {
  id: number;
  userId: number;
  location: string;
}

interface NotificationPayload {
  id: number;
  userId: number;
  message: string;
}

interface DynamicFeatureMetadata {
  id: number;
  userId: number;
  feature: string;
  metadata: string;
}

// src/lib/geo-currency.ts
import axios from 'axios';

interface Currency {
  code: string;
  symbol: string;
}

interface ExchangeRate {
  base: string;
  rates: { [key: string]: number };
}

const currencies: { [key: string]: Currency } = {
  USD: { code: 'USD', symbol: '$' },
  PKR: { code: 'PKR', symbol: '₨' },
  EUR: { code: 'EUR', symbol: '€' },
  GBP: { code: 'GBP', symbol: '£' },
  AED: { code: 'AED', symbol: 'د.إ' },
};

const getExchangeRate = async (base: string): Promise<ExchangeRate> => {
  const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${base}`);
  return response.data;
};

const useCurrency = () => {
  const [currency, setCurrency] = React.useState('USD');
  const [exchangeRate, setExchangeRate] = React.useState<ExchangeRate | null>(null);

  React.useEffect(() => {
    const fetchExchangeRate = async () => {
      const rate = await getExchangeRate(currency);
      setExchangeRate(rate);
    };
    fetchExchangeRate();
  }, [currency]);

  const convertPrice = (price: number, targetCurrency: string) => {
    if (!exchangeRate) return price;
    const rate = exchangeRate.rates[targetCurrency];
    return price * rate;
  };

  return { currency, convertPrice };
};

export { useCurrency };