import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { PublicationsByType } from '../../types';

interface Props {
  data: PublicationsByType;
}

export const PublicationsDonut: React.FC<Props> = ({ data }) => {
  const chartData = [
    { name: 'Revues', value: data.revue, color: '#6366F1' },
    { name: 'Conferences', value: data.conference, color: '#475569' },
  ];

  const total = data.revue + data.conference;
  const percentage = total > 0 ? ((data.revue / total) * 100).toFixed(1) : '0';

  return (
    <div className="flex items-center h-full">
      <div className="relative w-32 h-32 mr-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={45}
              outerRadius={60}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">{percentage}%</span>
        </div>
      </div>
      
      <div className="flex flex-col space-y-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center text-sm">
            <span 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: item.color }} 
            />
            <span className="text-slate-400 mr-1">{item.name}:</span>
            <span className="text-white font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};