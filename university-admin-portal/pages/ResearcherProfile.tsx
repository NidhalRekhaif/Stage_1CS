import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_RESEARCHERS } from '../constants';
import { Pencil, Globe, BookOpen } from 'lucide-react';

const ResearcherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Safe cast for mock finding
  const researcher = MOCK_RESEARCHERS.data.find(r => r.id === Number(id));

  if (!researcher) return <div className="text-white">Researcher not found</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
        <div className="text-sm text-slate-400 mb-4">
            <span className="hover:text-white cursor-pointer" onClick={() => navigate('/')}>Home</span> / <span className="hover:text-white cursor-pointer" onClick={() => navigate('/researchers')}>Researchers</span> / <span className="text-white">{researcher.prenom} {researcher.nom}</span>
        </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <img 
            src={researcher.avatar} 
            alt={researcher.nom} 
            className="w-32 h-32 rounded-full border-4 border-slate-800 object-cover"
        />
        <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Dr. {researcher.prenom} {researcher.nom}</h1>
            <p className="text-xl text-blue-400 mb-1">{researcher.grade}, AI & Robotics Lab</p>
            <p className="text-slate-400 mb-1">{researcher.email}</p>
            <p className="text-slate-400 mb-4">{researcher.telephone || '+1 (555) 123-4567'}</p>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                 {researcher.dblp_url && (
                    <a href={researcher.dblp_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-400 bg-blue-900/20 px-3 py-1.5 rounded-full hover:bg-blue-900/40 transition-colors">
                        <BookOpen size={14} /> DBLP
                    </a>
                 )}
                 {researcher.google_scholar_url && (
                    <a href={researcher.google_scholar_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-400 bg-blue-900/20 px-3 py-1.5 rounded-full hover:bg-blue-900/40 transition-colors">
                        <Globe size={14} /> Google Scholar
                    </a>
                 )}
            </div>
        </div>
        <div>
            <button 
                onClick={() => navigate(`/researchers/${researcher.id}/edit`)}
                className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
                <Pencil size={16} /> Edit Profile
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Number of Publications" value="128" />
        <StatBox label="Open Access" value="42" />
        <StatBox label="H-Index" value={researcher.h_index.toString()} />
        <StatBox label="I-10 Index" value={researcher.i_10_index.toString()} />
      </div>

      {/* Rank Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-slate-400 mb-6 font-medium">Rank Distribution</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
                <h4 className="text-white font-medium mb-2">Scimago:</h4>
                <p className="text-slate-400 text-sm font-mono">Q1 (45), Q2 (20)</p>
            </div>
            <div>
                <h4 className="text-white font-medium mb-2">DGRSDT:</h4>
                <p className="text-slate-400 text-sm font-mono">A (38), B (15)</p>
            </div>
            <div>
                <h4 className="text-white font-medium mb-2">CORE:</h4>
                <p className="text-slate-400 text-sm font-mono">A* (12), A (25)</p>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <h3 className="text-slate-400 text-sm font-medium mb-2">{label}</h3>
        <p className="text-4xl font-bold text-white">{value}</p>
    </div>
);

export default ResearcherProfile;
