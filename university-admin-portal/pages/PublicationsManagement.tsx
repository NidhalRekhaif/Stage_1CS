import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, CheckCircle, XCircle, Loader } from 'lucide-react';
import { PublicationApi, Publication } from '../api/PublicationApi';

const PublicationsManagement = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'Journal' | 'Conference'>('Journal');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchDoi, setSearchDoi] = useState('');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [openAccessOnly, setOpenAccessOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        // Fetch with max allowed limit to get all items at once
        const response = await PublicationApi.getAll(100, 1);
        
        // Handle both paginated and flat array responses
        let publications_data = Array.isArray(response) ? response : (response as any).data || [];
        let filtered = publications_data;

        if (searchTitle) {
          filtered = filtered.filter(p => p.titre?.toLowerCase().includes(searchTitle.toLowerCase()));
        }
        if (searchDoi) {
          filtered = filtered.filter(p => p.doi?.toLowerCase().includes(searchDoi.toLowerCase()));
        }
        if (selectedYear !== 'All Years') {
          filtered = filtered.filter(p => p.annee?.toString() === selectedYear);
        }
        if (openAccessOnly) {
          filtered = filtered.filter(p => p.is_open_access);
        }

        setPublications(filtered);
        // Reset to page 1 when filters change
        setCurrentPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load publications');
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [searchTitle, searchDoi, selectedYear, openAccessOnly]);

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
            <input type="text" placeholder="Search by title..." value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
         </div>
         <div className="md:col-span-1 space-y-1">
            <label className="text-xs text-slate-400 font-medium">DOI</label>
            <input type="text" placeholder="Search by DOI..." value={searchDoi} onChange={(e) => setSearchDoi(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
         </div>
         <div className="md:col-span-1 space-y-1">
            <label className="text-xs text-slate-400 font-medium">Year</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                <option>All Years</option>
                <option>2023</option>
                <option>2024</option>
                <option>2025</option>
            </select>
         </div>
         <div className="md:col-span-1 flex items-center h-full pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={openAccessOnly} onChange={(e) => setOpenAccessOnly(e.target.checked)} className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0" />
                <span className="text-sm text-white">Open Access Only</span>
            </label>
         </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 flex justify-center">
            <Loader className="animate-spin text-blue-500" size={40} />
          </div>
        ) : error ? (
          <div className="p-6 text-red-500">Error: {error}</div>
        ) : (
          <>
            {(() => {
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedPublications = publications.slice(startIndex, endIndex);
              const totalPages = Math.ceil(publications.length / itemsPerPage);

              return (
                <>
                  <table className="w-full text-left">
                      <thead className="bg-slate-950/50 text-slate-400 text-sm font-medium">
                          <tr>
                              <th className="px-6 py-4 w-1/2">Title</th>
                              <th className="px-6 py-4">Année Publication</th>
                              <th className="px-6 py-4 text-center">Open Access</th>
                              <th className="px-6 py-4"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                          {paginatedPublications.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                                  <td className="px-6 py-4 text-white font-medium">
                                      {p.titre}
                                  </td>
                                  <td className="px-6 py-4 text-slate-400">
                                      {p.annee_publication}
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
                  {/* Pagination */}
                  <div className="p-4 border-t border-slate-800 flex justify-between items-center text-sm">
                    <span className="text-slate-400">Showing {startIndex + 1} to {Math.min(endIndex, publications.length)} of {publications.length} results</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-slate-400 px-3 py-1">Page {currentPage} of {totalPages || 1}</span>
                      <button 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </>
        )}
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
