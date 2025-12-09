import React, { useState } from 'react';
import { Sidebar } from './components/SideBar';
import { Card } from './components/ui/Card';
import { PublicationsDonut } from './components/charts/DonutChart';
import { RankingsBar } from './components/charts/RankingBar';
import { ResearchersPage } from './components/ResearchersPage';
import { ResearcherProfile } from './components/ResearcherProfile';
import { MOCK_DATA } from './constants';
import { Beaker, ChevronDown } from 'lucide-react';

type Page = 'stats' | 'publications' | 'researchers' | 'researcher-profile';

export default function App() {
  const [data] = useState(MOCK_DATA);
  const [currentPage, setCurrentPage] = useState<Page>('stats');
  const [selectedResearcherId, setSelectedResearcherId] = useState<number | null>(null);

  const handleViewProfile = (researcherId: number) => {
    setSelectedResearcherId(researcherId);
    setCurrentPage('researcher-profile');
  };

  const handleBackFromProfile = () => {
    setSelectedResearcherId(null);
    setCurrentPage('researchers');
  };

  const renderStatsPage = () => (
    <>
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Stats Dashboard</h1>
          <p className="text-slate-400 text-sm">Detailed overview of research performance</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-[#1E293B] hover:bg-[#283549] rounded-lg text-sm transition-colors border border-slate-700">
            <Beaker size={16} className="mr-2 text-slate-400" />
            <span>Select Laboratory</span>
            <ChevronDown size={14} className="ml-2 text-slate-500" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Total Publications">
          <div className="h-full flex flex-col justify-center">
            <span className="text-5xl font-bold text-white block mb-2">
              {data.overview.total_publications}
            </span>
          </div>
        </Card>

        <Card title="Total Researchers">
          <div className="flex flex-col h-full justify-between">
            <span className="text-5xl font-bold text-white block mb-4">
              {data.researchers.total}
            </span>
            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <span className="text-slate-400 w-24">With Lab:</span>
                <span className="text-white font-medium">{data.researchers.with_lab}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-slate-400 w-24">Without Lab:</span>
                <span className="text-white font-medium">{data.researchers.without_lab}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Open Access">
          <div className="flex flex-col h-full justify-center space-y-4">
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-bold text-white">
                {data.overview.open_access.open_access_count}
              </span>
              <span className="text-slate-500 mb-1">count</span>
            </div>
            <div className="w-full bg-[#1E293B] h-4 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full" 
                style={{ width: `${data.overview.open_access.ratio * 100}%` }}
              />
            </div>
            <div className="flex justify-end">
              <span className="text-white font-bold text-sm">
                {(data.overview.open_access.ratio * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </Card>

        <Card title="Publications by Type">
          <PublicationsDonut data={data.overview.publications_by_type} />
        </Card>
      </div>

      <Card title="Rankings Distribution" className="min-h-[350px]">
        <RankingsBar data={data.overview.rankings} />
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0F111A] text-slate-200">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="ml-64">
        {currentPage === 'stats' && renderStatsPage()}
        {currentPage === 'researchers' && (
          <ResearchersPage onViewProfile={handleViewProfile} />
        )}
        {currentPage === 'researcher-profile' && selectedResearcherId !== null && (
          <ResearcherProfile 
            researcherId={selectedResearcherId} 
            onBack={handleBackFromProfile}
          />
        )}
        {currentPage === 'publications' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-white">Publications</h1>
            <p className="text-slate-400 mt-2">Publications page coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}