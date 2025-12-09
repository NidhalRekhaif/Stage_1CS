import React from 'react';
import type { Rankings } from '../../types';
import { RANKING_COLORS } from '../../constants';

interface Props {
  data: Rankings;
}

export const RankingsBar: React.FC<Props> = ({ data }) => {
  const allValues = [
    ...(Object.values(data.scimago_distribution) as number[]),
    ...(Object.values(data.dgrsdt_distribution) as number[]),
    ...(Object.values(data.core_distribution) as number[]),
  ];
  const maxValue = Math.max(...allValues, 1);
  const chartHeight = 200;

  const renderGroup = (title: string, distribution: Record<string, number>) => {
    return (
      <div className="flex flex-col flex-1">
        <div className="flex gap-4 items-end justify-center" style={{ height: `${chartHeight}px` }}>
          {Object.entries(distribution).map(([label, value]) => {
            const heightPixels = Math.max((value / maxValue) * chartHeight, value > 0 ? 4 : 0);
            const colorClass = RANKING_COLORS[label] || 'bg-slate-600';
            
            return (
              <div key={label} className="flex flex-col items-center" style={{ width: '60px' }}>
                {/* Value label */}
                <div className="h-6 flex items-center justify-center mb-1">
                  <span className="text-xs text-white font-bold">{value}</span>
                </div>
                
                {/* Bar container */}
                <div 
                  className="w-full relative flex items-end justify-center" 
                  style={{ height: `${chartHeight}px` }}
                >
                  <div 
                    className={`w-full ${colorClass} rounded-t transition-all duration-500 ease-out`}
                    style={{ height: `${heightPixels}px` }}
                  />
                </div>
                
                {/* Label */}
                <span className="text-xs text-slate-400 mt-1">{label}</span>
              </div>
            );
          })}
        </div>
        
        {/* Group title at bottom */}
        <h4 className="text-slate-300 text-sm mt-6 font-medium text-center">{title}</h4>
      </div>
    );
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
      {renderGroup('Scimago', data.scimago_distribution)}
      {renderGroup('DGRSDT', data.dgrsdt_distribution)}
      {renderGroup('CORE', data.core_distribution)}
    </div>
  );
};