// src/lib/geo-currency.ts
import axios from 'axios';

interface GeoLocation {
  ip: string;
  country_code: string;
  country_name: string;
  region_code: string;
  region_name: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
}

interface ExchangeRate {
  base: string;
  date: string;
  rates: {
    [key: string]: number;
  };
}

interface CurrencyConversion {
  from: string;
  to: string;
  amount: number;
  result: number;
}

class GeoCurrency {
  private geoLocation: GeoLocation;
  private exchangeRates: ExchangeRate;

  constructor() {
    this.geoLocation = {} as GeoLocation;
    this.exchangeRates = {} as ExchangeRate;
  }

  async getGeoLocation(ipAddress: string): Promise<GeoLocation> {
    try {
      const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
      this.geoLocation = response.data;
      return this.geoLocation;
    } catch (error) {
      console.error(error);
      return {} as GeoLocation;
    }
  }

  async getExchangeRates(baseCurrency: string): Promise<ExchangeRate> {
    try {
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      this.exchangeRates = response.data;
      return this.exchangeRates;
    } catch (error) {
      console.error(error);
      return {} as ExchangeRate;
    }
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<CurrencyConversion> {
    try {
      const exchangeRates = await this.getExchangeRates(fromCurrency);
      const conversionRate = exchangeRates.rates[toCurrency];
      const result = amount * conversionRate;
      return {
        from: fromCurrency,
        to: toCurrency,
        amount,
        result,
      };
    } catch (error) {
      console.error(error);
      return {} as CurrencyConversion;
    }
  }
}

export default GeoCurrency;

// Example usage:
const geoCurrency = new GeoCurrency();

geoCurrency.getGeoLocation('8.8.8.8').then((geoLocation) => {
  console.log(geoLocation);
});

geoCurrency.getExchangeRates('USD').then((exchangeRates) => {
  console.log(exchangeRates);
});

geoCurrency.convertCurrency(100, 'USD', 'EUR').then((conversion) => {
  console.log(conversion);
});