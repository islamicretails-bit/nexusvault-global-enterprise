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
            className="object-cover rounded-lg"
          />
        </a>
      </Link>
      <div className="mt-4">
        <h2 className="text-lg font-bold">{product.name}</h2>
        <p className="text-gray-600">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-bold">
            {convertPrice(product.price, currency)}
          </span>
          <Link href={`/products/${product.id}`}>
            <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              View Details
            </a>
          </Link>
        </div>
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
  role: 'ADMIN' | 'VENDOR' | 'CUSTOMER' | 'AFFILIATE';
}

interface Order {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  totalPrice: number;
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface AnalyticsLog {
  id: number;
  userId: number;
  eventType: string;
  eventData: string;
}

interface AffiliateReferral {
  id: number;
  affiliateId: number;
  referralId: number;
  commission: number;
}

interface WalletTransaction {
  id: number;
  userId: number;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
}

interface PayoutRequest {
  id: number;
  userId: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface AIServiceLog {
  id: number;
  userId: number;
  serviceType: string;
  requestData: string;
  responseData: string;
}

interface AIRouterConfig {
  groqApiKey: string;
  geminiApiKey: string;
  openaiApiKey: string;
}

interface GeoLocation {
  ip: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

interface PayoutRequestPayload {
  userId: number;
  amount: number;
}

interface NotificationPayload {
  userId: number;
  message: string;
}

interface DynamicFeatureMetadata {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
}

// src/lib/geo-currency.ts
import axios from 'axios';

interface GeoLocation {
  ip: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

const getGeoLocation = async (ip: string): Promise<GeoLocation> => {
  const response = await axios.get(`https://ip-api.com/json/${ip}`);
  return response.data;
};

const getCurrency = async (country: string): Promise<Currency> => {
  const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${country}`);
  return response.data;
};

const useCurrency = () => {
  const [currency, setCurrency] = React.useState<Currency | null>(null);
  const [geoLocation, setGeoLocation] = React.useState<GeoLocation | null>(null);

  React.useEffect(() => {
    const fetchGeoLocation = async () => {
      const ip = await axios.get('https://api.ipify.org');
      const location = await getGeoLocation(ip.data);
      setGeoLocation(location);
    };
    fetchGeoLocation();
  }, []);

  React.useEffect(() => {
    if (geoLocation) {
      const fetchCurrency = async () => {
        const currency = await getCurrency(geoLocation.country);
        setCurrency(currency);
      };
      fetchCurrency();
    }
  }, [geoLocation]);

  const convertPrice = (price: number, currencyCode: string) => {
    if (currency) {
      return (price * currency.rate).toFixed(2);
    }
    return price.toFixed(2);
  };

  return { currency, convertPrice };
};

export { useCurrency };