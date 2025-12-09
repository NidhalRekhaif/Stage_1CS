import React from 'react';

interface CardProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, className = '', children }) => {
  return (
    <div className={`bg-[#151A23] border border-slate-800 rounded-xl p-6 flex flex-col ${className}`}>
      <h3 className="text-slate-200 font-medium text-sm mb-4">{title}</h3>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};