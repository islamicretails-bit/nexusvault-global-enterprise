Here are some unit tests for the provided code using Jest and the `@prisma/client` testing utilities.

### src/lib/analytics.test.ts

import { getAnalyticsData } from './analytics';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

jest.mock('@prisma/client');

describe('getAnalyticsData', () => {
  const prisma = new PrismaClient();
  prisma.analytics.findMany.mockResolvedValueOnce([
    {
      id: '1',
      userId: '1',
      productId: '1',
      dateRange: '2022-01-01',
      views: 10,
      downloads: 5,
      revenue: 100,
    },
  ]);

  it('should return analytics data for a user', async () => {
    const params = { userId: '1' };
    const result = await getAnalyticsData(params);
    expect(result).toEqual([
      {
        id: '1',
        userId: '1',
        productId: '1',
        dateRange: '2022-01-01',
        views: 10,
        downloads: 5,
        revenue: 100,
      },
    ]);
  });

  it('should return analytics data for a product', async () => {
    const params = { productId: '1' };
    const result = await getAnalyticsData(params);
    expect(result).toEqual([
      {
        id: '1',
        userId: '1',
        productId: '1',
        dateRange: '2022-01-01',
        views: 10,
        downloads: 5,
        revenue: 100,
      },
    ]);
  });

  it('should return analytics data for a date range', async () => {
    const params = { dateRange: '2022-01-01' };
    const result = await getAnalyticsData(params);
    expect(result).toEqual([
      {
        id: '1',
        userId: '1',
        productId: '1',
        dateRange: '2022-01-01',
        views: 10,
        downloads: 5,
        revenue: 100,
      },
    ]);
  });

  it('should return an empty array if no parameters are provided', async () => {
    const params = {};
    const result = await getAnalyticsData(params);
    expect(result).toEqual([]);
  });

  it('should throw an error if the schema is invalid', async () => {
    const params = { userId: 1 };
    expect(() => getAnalyticsData(params)).rejects.toThrowError(
      'Invalid schema'
    );
  });
});

### src/app/api/admin/analytics/route.test.ts

import { getAnalytics } from './route';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

jest.mock('./route');

describe('getAnalytics', () => {
  const req = new NextApiRequest();
  const res = new NextApiResponse();

  it('should return analytics data for a user', async () => {
    req.query = { userId: '1' };
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    await getAnalytics(req, res);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it('should return analytics data for a product', async () => {
    req.query = { productId: '1' };
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    await getAnalytics(req, res);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it('should return analytics data for a date range', async () => {
    req.query = { dateRange: '2022-01-01' };
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    await getAnalytics(req, res);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it('should return an empty array if no parameters are provided', async () => {
    req.query = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    await getAnalytics(req, res);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it('should return a 500 error if an error occurs', async () => {
    const error = new Error('Internal Server Error');
    req.query = { userId: '1' };
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    await getAnalytics(req, res).catch(() => {});
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it('should return a 405 error if the method is not allowed', async () => {
    req.method = 'POST';
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    await getAnalytics(req, res);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledTimes(1);
  });
});

### src/app/api/admin/analytics/resolvers.test.ts

import { resolvers } from './resolvers';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');

describe('resolvers', () => {
  const prisma = new PrismaClient();
  prisma.analytics.findMany.mockResolvedValueOnce([
    {
      id: '1',
      userId: '1',
      productId: '1',
      dateRange: '2022-01-01',
      views: 10,
      downloads: 5,
      revenue: 100,
    },
  ]);

  it('should return analytics data for a user', async () => {
    const result = await resolvers.Query.getAnalytics(
      null,
      { userId: '1', productId: '1', dateRange: '2022-01-01' }
    );
    expect(result).toEqual([
      {
        id: '1',
        userId: '1',
        productId: '1',
        dateRange: '2022-01-01',
        views: 10,
        downloads: 5,
        revenue: 100,
      },
    ]);
  });

  it('should return analytics data for a product', async () => {
    const result = await resolvers.Query.getAnalytics(
      null,
      { userId: '1', productId: '1', dateRange: '2022-01-01' }
    );
    expect(result).toEqual([
      {
        id: '1',
        userId: '1',
        productId: '1',
        dateRange: '2022-01-01',
        views: 10,
        downloads: 5,
        revenue: 100,
      },
    ]);
  });

  it('should return analytics data for a date range', async () => {
    const result = await resolvers.Query.getAnalytics(
      null,
      { userId: '1', productId: '1', dateRange: '2022-01-01' }
    );
    expect(result).toEqual([
      {
        id: '1',
        userId: '1',
        productId: '1',
        dateRange: '2022-01-01',
        views: 10,
        downloads: 5,
        revenue: 100,
      },
    ]);
  });

  it('should return an empty array if no parameters are provided', async () => {
    const result = await resolvers.Query.getAnalytics(
      null,
      { userId: '1', productId: '1', dateRange: '2022-01-01' }
    );
    expect(result).toEqual([]);
  });
});

Note that these tests are just a starting point and you may need to add more tests to cover all the scenarios. Also, you may need to modify the tests to fit your specific use case.