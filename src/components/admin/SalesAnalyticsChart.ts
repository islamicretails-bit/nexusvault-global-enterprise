// src/components/admin/SalesAnalyticsChart.ts
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useQuery } from '@apollo/client';
import { GET_SALES_ANALYTICS } from '../../lib/graphql/queries';
import { SalesAnalyticsData } from '../../types';
import { formatCurrency } from '../../lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SalesAnalyticsChartProps {
  startDate: string;
  endDate: string;
}

const SalesAnalyticsChart: React.FC<SalesAnalyticsChartProps> = ({
  startDate,
  endDate,
}) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Sales',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  });

  const { data, error, loading } = useQuery(GET_SALES_ANALYTICS, {
    variables: {
      startDate,
      endDate,
    },
  });

  useEffect(() => {
    if (data) {
      const salesData: SalesAnalyticsData[] = data.salesAnalytics;
      const labels = salesData.map((data) => data.date);
      const sales = salesData.map((data) => data.sales);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Sales',
            data: sales,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      });
    }
  }, [data]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Sales Analytics',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
      <div>
        <h2>Sales Summary</h2>
        <p>Total Sales: {formatCurrency(data?.totalSales)}</p>
        <p>Average Sales: {formatCurrency(data?.averageSales)}</p>
      </div>
    </div>
  );
};

export default SalesAnalyticsChart;