import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { BCGPoint } from '../types';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
  points: BCGPoint[];
}

export const BCGMatrix: React.FC<Props> = ({ points }) => {
  const data = {
    datasets: [
      {
        label: 'Strategic Sectors',
        data: points.map((p) => ({ x: p.x, y: p.y, name: p.name })),
        backgroundColor: points.map((p) => {
          if (p.x > 0.5 && p.y > 0.5) return '#00A651'; // Star
          if (p.x <= 0.5 && p.y > 0.5) return '#3498DB'; // Dark Horse
          if (p.x > 0.5 && p.y <= 0.5) return '#F39C12'; // Cash Cow
          return '#95A5A6'; // Marginal
        }),
        pointRadius: 10,
        pointHoverRadius: 12,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        max: 1,
        title: { display: true, text: 'Market Share', color: '#636E72' },
        grid: { color: '#DFE6E9' },
        ticks: { color: '#636E72' },
      },
      y: {
        min: 0,
        max: 1,
        title: { display: true, text: 'Growth Rate', color: '#636E72' },
        grid: { color: '#DFE6E9' },
        ticks: { color: '#636E72' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const p = context.raw;
            return `${p.name}: Share ${(p.x * 100).toFixed(0)}%, Growth ${(p.y * 100).toFixed(0)}%`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64 w-full relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-px h-full bg-war-border/50" />
        <div className="h-px w-full bg-war-border/50" />
      </div>
      <Scatter data={data} options={options} />
    </div>
  );
};
