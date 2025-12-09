import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PUBLICATIONS } from '../constants';
import { Pencil, Lock, LockOpen, ExternalLink } from 'lucide-react';

const PublicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const publication = MOCK_PUBLICATIONS.data.find(p => p.id === Number(id));

  if (!publication) return <div className="text-white">Publication not found</div>;

  return (
    <div className="space-y-6">
       <div className="text-sm text-slate-400 mb-2">
            <span className="hover:text-white cursor-pointer" onClick={() => navigate('/')}>Home</span> / <span className="hover:text-white cursor-pointer" onClick={() => navigate('/publications')}>Publications</span> / <span className="text-white truncate">{publication.titre.substring(0, 30)}...</span>
        </div>

      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-white max-w-4xl">{publication.titre}</h1>
        <button 
            onClick={() => navigate(`/publications/${publication.id}/edit`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Pencil size={18} />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex gap-4 mb-6">
                    <span className="bg-blue-900/30 text-blue-400 border border-blue-900/50 px-3 py-1 rounded text-sm font-medium flex items-center gap-2">
                        📅 {publication.annee_publication}
                    </span>
                    <span className={`px-3 py-1 rounded text-sm font-medium flex items-center gap-2 border ${publication.is_open_access ? 'bg-green-900/30 text-green-400 border-green-900/50' : 'bg-red-900/30 text-red-400 border-red-900/50'}`}>
                        {publication.is_open_access ? <LockOpen size={14} /> : <Lock size={14} />}
                        {publication.is_open_access ? 'Open Access' : 'Closed Access'}
                    </span>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-4">Abstract</h2>
                <p className="text-slate-300 leading-relaxed">
                    {publication.abstract}
                </p>
            </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Information</h3>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">Citations</p>
                        <p className="text-white text-lg font-mono">{publication.citations.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">DOI</p>
                        <p className="text-blue-400 break-all hover:underline cursor-pointer">{publication.doi || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">URL</p>
                        <a href={publication.url} target="_blank" rel="noreferrer" className="text-blue-400 break-all hover:underline">{publication.url}</a>
                    </div>
                </div>
            </div>

             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Journal</h3>
                <p className="text-slate-300 mb-4">Published in '{publication.journal}'</p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                    <ExternalLink size={16} /> View Journal Details
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationDetails;
