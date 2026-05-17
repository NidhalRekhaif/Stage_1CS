import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Loader, ChevronDown } from 'lucide-react';
import { ChercheurApi } from '../api/ChercheurApi';
import { LaboApi } from '../api/LaboApi';

const ResearchersDirectory = () => {
  const navigate = useNavigate();
  const [researchers, setResearchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  const [labs, setLabs] = useState<any[]>([]);
  const [showLabDropdown, setShowLabDropdown] = useState(false);

  // Fetch laboratories on mount
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const data = await LaboApi.getAll();
        const labsArray = Array.isArray(data) ? data : (data as any).data || [];
        setLabs(labsArray);
      } catch (err) {
        console.error('Failed to load laboratories:', err);
      }
    };
    fetchLabs();
  }, []);

  useEffect(() => {
    const fetchResearchers = async () => {
      try {
        setLoading(true);
        const data = await ChercheurApi.getAll({
          nom: searchName ? searchName : undefined,
          labo_id: selectedLab ? selectedLab : undefined,
          page: 1,
          limit: 100
        });
        
        if ('data' in data) {
          setResearchers(data.data);
        } else {
          setResearchers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load researchers');
      } finally {
        setLoading(false);
      }
    };

    fetchResearchers();
  }, [searchName, selectedLab]);

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
            placeholder="Search by last name..." 
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowLabDropdown(!showLabDropdown)}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <span>{selectedLab ? labs.find(l => l.id === selectedLab)?.nom || 'Lab' : 'All Laboratories'}</span>
            <ChevronDown size={16} />
          </button>
          {showLabDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-lg z-10 min-w-48">
              <button
                onClick={() => {
                  setSelectedLab(null);
                  setShowLabDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-slate-800 transition-colors ${!selectedLab ? 'text-blue-500 bg-slate-800' : 'text-slate-300'}`}
              >
                All Laboratories
              </button>
              {labs.map(lab => (
                <button
                  key={lab.id}
                  onClick={() => {
                    setSelectedLab(lab.id);
                    setShowLabDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-slate-800 transition-colors ${selectedLab === lab.id ? 'text-blue-500 bg-slate-800' : 'text-slate-300'}`}
                >
                  {lab.nom}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 flex justify-center">
            <Loader className="animate-spin text-blue-500" size={40} />
          </div>
        ) : error ? (
          <div className="p-6 text-red-500">Error: {error}</div>
        ) : (
          <table className="w-full text-left">
              <thead className="bg-slate-950/50 text-slate-400 text-sm font-medium">
                  <tr>
                      <th className="px-6 py-4">First Name</th>
                      <th className="px-6 py-4">Last Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Laboratory</th>
                      <th className="px-6 py-4">Grade</th>
                      <th className="px-6 py-4"></th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                  {researchers.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                  <img src={r.avatar || 'https://via.placeholder.com/40'} alt={r.nom} className="w-10 h-10 rounded-full object-cover bg-slate-800" />
                                  <span className="text-white font-medium">{r.prenom}</span>
                              </div>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{r.nom}</td>
                          <td className="px-6 py-4 text-slate-400">{r.email || 'N/A'}</td>
                          <td className="px-6 py-4 text-slate-400">
                            {r.labo_id ? labs.find(l => l.id === r.labo_id)?.nom || 'Unknown Lab' : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-slate-400">{r.grade || 'N/A'}</td>
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
        )}
      </div>
    </div>
  );
};

export default ResearchersDirectory;
