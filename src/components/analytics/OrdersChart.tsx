import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

interface OrdersChartProps {
  data: ChartData<'bar'>;
  options: ChartOptions<'bar'>;
}

const OrdersChart: React.FC<OrdersChartProps> = ({ data, options }) => {
  return (
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default OrdersChart;
