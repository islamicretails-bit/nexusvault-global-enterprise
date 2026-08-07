// src/lib/geo-currency.ts

import axios from 'axios';
import { GeoLocation } from '../types/index';

interface ExchangeRate {
  currency: string;
  rate: number;
}

interface GeoCurrencyResponse {
  ip: string;
  country_code: string;
  country_name: string;
  region_code: string;
  region_name: string;
  city: string;
  zip: string;
  latitude: number;
  longitude: number;
  time_zone: string;
  currency: string;
  exchange_rate: ExchangeRate[];
}

class GeoCurrency {
  private apiEndpoint: string;
  private apiKey: string;

  constructor(apiEndpoint: string, apiKey: string) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
  }

  async getGeoLocation(ipAddress: string): Promise<GeoLocation> {
    const response = await axios.get(`${this.apiEndpoint}/ip/${ipAddress}?key=${this.apiKey}`);
    const geoLocation: GeoLocation = {
      ip: response.data.ip,
      countryCode: response.data.country_code,
      countryName: response.data.country_name,
      regionCode: response.data.region_code,
      regionName: response.data.region_name,
      city: response.data.city,
      zip: response.data.zip,
      latitude: response.data.latitude,
      longitude: response.data.longitude,
      timeZone: response.data.time_zone,
      currency: response.data.currency,
    };
    return geoLocation;
  }

  async getExchangeRate(currency: string): Promise<ExchangeRate> {
    const response = await axios.get(`${this.apiEndpoint}/exchange_rate/${currency}?key=${this.apiKey}`);
    const exchangeRate: ExchangeRate = {
      currency: response.data.currency,
      rate: response.data.rate,
    };
    return exchangeRate;
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    const fromExchangeRate = await this.getExchangeRate(fromCurrency);
    const toExchangeRate = await this.getExchangeRate(toCurrency);
    const convertedAmount = amount * (toExchangeRate.rate / fromExchangeRate.rate);
    return convertedAmount;
  }
}

export default GeoCurrency;

// src/types/index.ts (GeoLocation interface)

export interface GeoLocation {
  ip: string;
  countryCode: string;
  countryName: string;
  regionCode: string;
  regionName: string;
  city: string;
  zip: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  currency: string;
}

// Example usage in src/app/api/geo-currency/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import GeoCurrency from '../../lib/geo-currency';

const geoCurrency = new GeoCurrency('https://api.example.com', 'YOUR_API_KEY');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const ipAddress = req.query.ipAddress;
    const geoLocation = await geoCurrency.getGeoLocation(ipAddress as string);
    res.json(geoLocation);
  } else if (req.method === 'POST') {
    const { amount, fromCurrency, toCurrency } = req.body;
    const convertedAmount = await geoCurrency.convertCurrency(amount, fromCurrency, toCurrency);
    res.json({ convertedAmount });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}