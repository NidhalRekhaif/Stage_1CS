import React from 'react';
import { MOCK_RESEARCHERS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter } from 'lucide-react';

const ResearchersDirectory = () => {
  const navigate = useNavigate();
  const researchers = MOCK_RESEARCHERS.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Researchers Directory</h1>
        </div>
        <button 
          onClick={() => navigate('/researchers/add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} />
          Add Researcher
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Search by first name or last name..." 
            className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 px-4 py-3 rounded-lg hover:bg-slate-800">
            <span>Filter by Laboratory</span>
            <Filter size={16} />
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-slate-400 text-sm font-medium">
                <tr>
                    <th className="px-6 py-4">First Name</th>
                    <th className="px-6 py-4">Last Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Grade</th>
                    <th className="px-6 py-4"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {researchers.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <img src={r.avatar} alt={r.nom} className="w-10 h-10 rounded-full object-cover bg-slate-800" />
                                <span className="text-white font-medium">{r.prenom}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{r.nom}</td>
                        <td className="px-6 py-4 text-slate-400">{r.email}</td>
                        <td className="px-6 py-4 text-slate-400">{r.grade}</td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => navigate(`/researchers/${r.id}`)}
                                className="text-blue-500 hover:text-blue-400 font-medium text-sm"
                            >
                                View Profile
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResearchersDirectory;
