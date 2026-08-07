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

  async getExchangeRate(currency: string): Promise<ExchangeRate[]> {
    const response = await axios.get(`${this.apiEndpoint}/exchange_rate/${currency}?key=${this.apiKey}`);
    const exchangeRates: ExchangeRate[] = response.data.exchange_rate;
    return exchangeRates;
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    const exchangeRates = await this.getExchangeRate(fromCurrency);
    const toCurrencyRate = exchangeRates.find((rate) => rate.currency === toCurrency);
    if (!toCurrencyRate) {
      throw new Error(`No exchange rate found for ${toCurrency}`);
    }
    const convertedAmount = amount * toCurrencyRate.rate;
    return convertedAmount;
  }
}

export default GeoCurrency;

// src/types/index.ts (GeoLocation interface)
interface GeoLocation {
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

// Example usage
import GeoCurrency from './geo-currency';

const geoCurrency = new GeoCurrency('https://api.example.com', 'YOUR_API_KEY');

geoCurrency.getGeoLocation('8.8.8.8').then((geoLocation) => {
  console.log(geoLocation);
});

geoCurrency.getExchangeRate('USD').then((exchangeRates) => {
  console.log(exchangeRates);
});

geoCurrency.convertCurrency(100, 'USD', 'EUR').then((convertedAmount) => {
  console.log(convertedAmount);
});