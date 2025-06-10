import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

interface SalesChartProps {
  data: ChartData<'line'>;
  options: ChartOptions<'line'>;
}

const SalesChart: React.FC<SalesChartProps> = ({ data, options }) => {
  return (
    <div style={{ height: '300px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default SalesChart;
