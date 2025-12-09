import React, { useState, useEffect } from 'react';
import { Edit, ExternalLink } from 'lucide-react';

interface ResearcherProfileData {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  grade: string;
  labo_id: number | null;
  labo_name?: string;
  telephone: string | null;
  h_index: number;
  i_10_index: number;
  google_scholar_url: string | null;
  dblp_url: string | null;
  publications_count: number;
  open_access_count: number;
  rank_distribution?: {
    scimago: Record<string, number>;
    dgrsdt: Record<string, number>;
    core: Record<string, number>;
  };
}

interface ResearcherProfileProps {
  researcherId: number;
  onBack: () => void;
}

const fetchResearcherProfile = async (id: number): Promise<ResearcherProfileData> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    id,
    prenom: "Evelyn",
    nom: "Reed",
    email: "evelyn.reed@university.edu",
    grade: "Professor",
    labo_id: 1,
    labo_name: "AI & Robotics Lab",
    telephone: "+1 (555) 123-4567",
    h_index: 31,
    i_10_index: 87,
    google_scholar_url: "https://scholar.google.com/citations?user=example",
    dblp_url: "https://dblp.org/pid/example",
    publications_count: 128,
    open_access_count: 42,
    rank_distribution: {
      scimago: {
        "Q1": 45,
        "Q2": 20
      },
      dgrsdt: {
        "A": 38,
        "B": 15
      },
      core: {
        "A*": 12,
        "A": 25
      }
    }
  };
};

export const ResearcherProfile: React.FC<ResearcherProfileProps> = ({ researcherId, onBack }) => {
  const [profile, setProfile] = useState<ResearcherProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchResearcherProfile(researcherId);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching researcher profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [researcherId]);

  const getAvatarUrl = (id: number) => {
    return `https://i.pravatar.cc/300?img=${id}`;
  };

  const formatRankDistribution = (ranks: Record<string, number>) => {
    return Object.entries(ranks)
      .map(([key, value]) => `${key} (${value})`)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Researcher not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center space-x-2 text-sm text-slate-400 mb-8">
        <button onClick={onBack} className="hover:text-white transition-colors">
          Home
        </button>
        <span>/</span>
        <button onClick={onBack} className="hover:text-white transition-colors">
          Researchers
        </button>
        <span>/</span>
        <span className="text-white">Dr. {profile.prenom} {profile.nom}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start space-x-6">
          <img
            src={getAvatarUrl(profile.id)}
            alt={profile.prenom + ' ' + profile.nom}
            className="w-32 h-32 rounded-full object-cover"
          />
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Dr. {profile.prenom} {profile.nom}
            </h1>
            <p className="text-slate-300 text-lg mb-1">
              {profile.grade}, <span className="text-blue-400">{profile.labo_name}</span>
            </p>
            <p className="text-slate-300 mb-1">{profile.email}</p>
            {profile.telephone && (
              <p className="text-slate-300 mb-4">{profile.telephone}</p>
            )}
            <div className="flex items-center space-x-4">
              {profile.dblp_url && (
                
                  href={profile.dblp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  <ExternalLink size={16} className="mr-1" />
                  DBLP
                </a>
              )}
              {profile.google_scholar_url && (
                
                  href={profile.google_scholar_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  <ExternalLink size={16} className="mr-1" />
                  Google Scholar
                </a>
              )}
            </div>
          </div>
        </div>
        <button className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition-colors">
          <Edit size={16} className="mr-2" />
          Edit Profile
        </button>
      </div>

      <div className="border-b border-slate-800 mb-8">
        <div className="flex space-x-8">
          <button className="pb-3 text-blue-400 border-b-2 border-blue-400 font-medium">
            Overview
          </button>
          <button className="pb-3 text-slate-400 hover:text-white transition-colors">
            Publications
          </button>
          <button className="pb-3 text-slate-400 hover:text-white transition-colors">
            Co-authors
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-[#151A23] border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm mb-2">Number of Publications</h3>
          <p className="text-5xl font-bold text-white">{profile.publications_count}</p>
        </div>

        <div className="bg-[#151A23] border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm mb-2">Open Access</h3>
          <p className="text-5xl font-bold text-white">{profile.open_access_count}</p>
        </div>

        <div className="bg-[#151A23] border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm mb-2">H-Index</h3>
          <p className="text-5xl font-bold text-white">{profile.h_index}</p>
        </div>

        <div className="bg-[#151A23] border border-slate-800 rounded-xl p-6">
          <h3 className="text-slate-400 text-sm mb-2">I-10 Index</h3>
          <p className="text-5xl font-bold text-white">{profile.i_10_index}</p>
        </div>
      </div>

      {profile.rank_distribution && (
        <div className="bg-[#151A23] border border-slate-800 rounded-xl p-6">
          <h3 className="text-white text-lg font-semibold mb-6">Rank Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-slate-400 text-sm font-medium mb-2">Scimago:</h4>
              <p className="text-white">{formatRankDistribution(profile.rank_distribution.scimago)}</p>
            </div>
            <div>
              <h4 className="text-slate-400 text-sm font-medium mb-2">DGRSDT:</h4>
              <p className="text-white">{formatRankDistribution(profile.rank_distribution.dgrsdt)}</p>
            </div>
            <div>
              <h4 className="text-slate-400 text-sm font-medium mb-2">CORE:</h4>
              <p className="text-white">{formatRankDistribution(profile.rank_distribution.core)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};