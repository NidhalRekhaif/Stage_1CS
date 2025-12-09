import React, { useState } from 'react';
import { MOCK_PUBLICATIONS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, CheckCircle, XCircle } from 'lucide-react';

const PublicationsManagement = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'Journal' | 'Conference'>('Journal');
  const publications = MOCK_PUBLICATIONS.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Publications Management</h1>
          <p className="text-slate-400">View, search, and manage all university publications.</p>
        </div>
        <button 
            onClick={() => navigate('/publications/add')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} />
          Add New Publication
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex gap-6">
        <TabButton active={tab === 'Journal'} onClick={() => setTab('Journal')} label="Journal" />
        <TabButton active={tab === 'Conference'} onClick={() => setTab('Conference')} label="Conference" />
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
         <div className="md:col-span-1 space-y-1">
            <label className="text-xs text-slate-400 font-medium">Title</label>
            <input type="text" placeholder="Search by title..." className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
         </div>
         <div className="md:col-span-1 space-y-1">
            <label className="text-xs text-slate-400 font-medium">DOI</label>
            <input type="text" placeholder="Search by DOI..." className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
         </div>
         <div className="md:col-span-1 space-y-1">
            <label className="text-xs text-slate-400 font-medium">Year</label>
            <select className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                <option>All Years</option>
                <option>2023</option>
                <option>2024</option>
            </select>
         </div>
         <div className="md:col-span-1 flex items-center h-full pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0" />
                <span className="text-sm text-white">Open Access Only</span>
            </label>
         </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-slate-400 text-sm font-medium">
                <tr>
                    <th className="px-6 py-4 w-1/2">Title</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Open Access</th>
                    <th className="px-6 py-4"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {publications.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">
                            {p.titre}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                            {p.annee_publication}-09-15
                        </td>
                        <td className="px-6 py-4 flex justify-center">
                            {p.is_open_access ? (
                                <CheckCircle className="text-green-500" size={20} />
                            ) : (
                                <XCircle className="text-slate-600" size={20} />
                            )}
                        </td>
                        <td className="px-6 py-4 text-right">
                             <button 
                                onClick={() => navigate(`/publications/${p.id}`)}
                                className="border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-md transition-colors"
                            >
                                Details
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
         {/* Pagination Mock */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center text-sm">
             <span className="text-slate-400">Showing 1 to 10 of 45 results</span>
             <div className="flex gap-2">
                 <button className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded hover:bg-slate-800">Previous</button>
                 <button className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded hover:bg-slate-800">Next</button>
             </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
    <button 
        onClick={onClick}
        className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${active ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-white'}`}
    >
        {label}
    </button>
);

export default PublicationsManagement;
