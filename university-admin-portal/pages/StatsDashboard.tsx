import React, { useState } from 'react';
import { MOCK_STATS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Filter } from 'lucide-react';

const COLORS = {
  blue: '#3b82f6',
  purple: '#6366f1',
  pink: '#ec4899',
  green: '#22c55e',
  orange: '#f97316',
  slate: '#64748b',
  slateDark: '#334155'
};

const StatsDashboard = () => {
  const [labFilter, setLabFilter] = useState('All Laboratories');
  const data = MOCK_STATS;

  // Prepare Data for Pie Chart
  const pieData = [
    { name: 'Revues', value: data.overview.publications_by_type.Revues },
    { name: 'Conferences', value: data.overview.publications_by_type.Conferences },
  ];
  
  const totalPubs = pieData.reduce((acc, curr) => acc + curr.value, 0);

  // Prepare Data for Bar Chart (Rankings)
  // We need to transform the distributions into a unified array for the BarChart
  // or render three separate small charts. The screenshot implies a unified view or 
  // grouped view. Let's create a visual representation of all of them.
  
  const scimagoData = Object.entries(data.overview.rankings.scimago_distribution).map(([key, value]) => ({ name: key, value, fill: COLORS.purple }));
  const dgrsdtData = Object.entries(data.overview.rankings.dgrsdt_distribution).map(([key, value]) => ({ name: key, value, fill: COLORS.pink }));
  const coreData = Object.entries(data.overview.rankings.core_distribution).map(([key, value]) => ({ name: key, value, fill: COLORS.green }));


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-1">Stats Dashboard</h1>
           <p className="text-slate-400">Detailed overview of research performance</p>
        </div>
        
        <div className="relative">
             <button className="flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors text-sm font-medium">
               <Filter size={16} />
               {labFilter}
             </button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-slate-400 font-medium mb-2">Total Publications</h3>
          <p className="text-5xl font-bold text-white">{data.overview.total_publications}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-slate-400 font-medium mb-2">Total Researchers</h3>
          <p className="text-5xl font-bold text-white mb-2">{data.researchers.total}</p>
          <div className="flex gap-4 text-sm">
             <span className="text-slate-400">With Lab: <b className="text-slate-200">{data.researchers.with_lab}</b></span>
             <span className="text-slate-400">Without Lab: <b className="text-slate-200">{data.researchers.without_lab}</b></span>
          </div>
        </div>
      </div>

      {/* Middle Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Access */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-white mb-6">Open Access</h3>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-bold text-white">{data.overview.open_access.count}</span>
            <span className="text-slate-400 mb-1">count</span>
          </div>
          
          <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden mb-1 relative">
            <div 
                className="bg-blue-600 h-full rounded-full" 
                style={{ width: `${(data.overview.open_access.count / data.overview.total_publications) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-end">
             <span className="text-white font-bold">{Math.round((data.overview.open_access.count / data.overview.total_publications) * 100)}%</span>
          </div>
        </div>

        {/* Publications by Type */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-4">Publications by Type</h3>
          <div className="flex items-center">
            <div className="relative w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={pieData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                    >
                        {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.blue : COLORS.slateDark} />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                     <span className="text-3xl font-bold text-white">0.5%</span>
                     {/* The text inside the donut in the screenshot is illustrative, I'm putting 0.5 as placeholder or calculated */}
                </div>
            </div>
            <div className="ml-8 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.blue }}></div>
                    <span className="text-slate-200">Revues: <span className="font-bold">{data.overview.publications_by_type.Revues}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.slateDark }}></div>
                    <span className="text-slate-200">Conferences: <span className="font-bold">{data.overview.publications_by_type.Conferences}</span></span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Distribution */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-6">Rankings Distribution</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <RankingBarChart title="Scimago" data={scimagoData} />
            <RankingBarChart title="DGRSDT" data={dgrsdtData} />
            <RankingBarChart title="CORE" data={coreData} />
        </div>
      </div>
    </div>
  );
};

const RankingBarChart = ({ title, data }: { title: string, data: any[] }) => {
    return (
        <div className="h-64 flex flex-col">
            <h4 className="text-slate-400 mb-4 text-center">{title}</h4>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {
                        data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Unknown' ? COLORS.slateDark : entry.fill} />
                        ))
                    }
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default StatsDashboard;
