import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { AddResearcherModal } from './AddResearcherModal';

interface Researcher {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  grade: string;
  labo_id: number | null;
  telephone: string | null;
  h_index: number;
  i_10_index: number;
  google_scholar_url: string | null;
  dblp_url: string | null;
}

interface ResearchersResponse {
  total: number;
  page: number;
  limit: number;
  data: Researcher[];
}

interface ResearchersPageProps {
  onViewProfile: (researcherId: number) => void;
}

// Mock data for testing
const MOCK_RESEARCHERS_DATA: Researcher[] = [
  {
    id: 1,
    prenom: 'Evelyn',
    nom: 'Reed',
    email: 'e.reed@university.edu',
    grade: 'Professor',
    labo_id: 1,
    telephone: '+1 (555) 123-4567',
    h_index: 31,
    i_10_index: 87,
    google_scholar_url: 'https://scholar.google.com/citations?user=example',
    dblp_url: 'https://dblp.org/pid/example',
  },
  {
    id: 2,
    prenom: 'Ben',
    nom: 'Carter',
    email: 'b.carter@university.edu',
    grade: 'Associate Professor',
    labo_id: 2,
    telephone: '+1 (555) 123-4568',
    h_index: 25,
    i_10_index: 65,
    google_scholar_url: 'https://scholar.google.com/citations?user=example2',
    dblp_url: 'https://dblp.org/pid/example2',
  },
  {
    id: 3,
    prenom: 'Anya',
    nom: 'Sharma',
    email: 'a.sharma@university.edu',
    grade: 'Professor',
    labo_id: 1,
    telephone: '+1 (555) 123-4569',
    h_index: 42,
    i_10_index: 95,
    google_scholar_url: 'https://scholar.google.com/citations?user=example3',
    dblp_url: 'https://dblp.org/pid/example3',
  },
  {
    id: 4,
    prenom: 'Leo',
    nom: 'Kim',
    email: 'l.kim@university.edu',
    grade: 'Assistant Professor',
    labo_id: 3,
    telephone: '+1 (555) 123-4570',
    h_index: 18,
    i_10_index: 45,
    google_scholar_url: 'https://scholar.google.com/citations?user=example4',
    dblp_url: 'https://dblp.org/pid/example4',
  },
  {
    id: 5,
    prenom: 'Olivia',
    nom: 'Chen',
    email: 'o.chen@university.edu',
    grade: 'Professor',
    labo_id: 2,
    telephone: '+1 (555) 123-4571',
    h_index: 38,
    i_10_index: 82,
    google_scholar_url: 'https://scholar.google.com/citations?user=example5',
    dblp_url: 'https://dblp.org/pid/example5',
  },
];

// Helper function to get lab name
const getLabName = (laboId: number | null): string => {
  if (!laboId) return 'No Lab';
  const labs: Record<number, string> = {
    1: 'Computer Science Lab',
    2: 'Biology Research Center',
    3: 'Physics Institute',
  };
  return labs[laboId] || `Lab ${laboId}`;
};

// Simulated API fetch function
const fetchResearchers = async (
  page: number,
  limit: number,
  firstNameSearch?: string,
  lastNameSearch?: string
): Promise<ResearchersResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  let filteredData = [...MOCK_RESEARCHERS_DATA];
  
  if (firstNameSearch) {
    filteredData = filteredData.filter(r => 
      r.prenom.toLowerCase().includes(firstNameSearch.toLowerCase())
    );
  }
  
  if (lastNameSearch) {
    filteredData = filteredData.filter(r => 
      r.nom.toLowerCase().includes(lastNameSearch.toLowerCase())
    );
  }

  const total = filteredData.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    total,
    page,
    limit,
    data: paginatedData
  };
};

export const ResearchersPage: React.FC<ResearchersPageProps> = ({ onViewProfile }) => {
  const [researchers, setResearchers] = useState<ResearchersResponse>({
    total: 0,
    page: 1,
    limit: 10,
    data: []
  });
  const [loading, setLoading] = useState(false);
  const [firstNameSearch, setFirstNameSearch] = useState('');
  const [lastNameSearch, setLastNameSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalPages = Math.ceil(researchers.total / itemsPerPage);

  const loadResearchers = async () => {
    setLoading(true);
    try {
      const data = await fetchResearchers(
        currentPage,
        itemsPerPage,
        firstNameSearch,
        lastNameSearch
      );
      setResearchers(data);
    } catch (error) {
      console.error('Error fetching researchers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResearchers();
  }, [currentPage, itemsPerPage, firstNameSearch, lastNameSearch]);

  const handleAddResearcher = (newResearcher: any) => {
    console.log('New researcher:', newResearcher);
    loadResearchers();
    setIsAddModalOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handleFirstNameSearch = (value: string) => {
    setFirstNameSearch(value);
    setCurrentPage(1);
  };

  const handleLastNameSearch = (value: string) => {
    setLastNameSearch(value);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const getAvatarUrl = (id: number) => `https://i.pravatar.cc/150?img=${id}`;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Researchers Directory</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add Researcher
        </button>
      </div>

      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by First Name"
            value={firstNameSearch}
            onChange={(e) => handleFirstNameSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by Last Name"
            value={lastNameSearch}
            onChange={(e) => handleLastNameSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <button className="flex items-center justify-between px-4 py-2 bg-[#1E293B] border border-slate-700 rounded-lg text-slate-200 hover:bg-[#283549] transition-colors">
          <span className="text-sm">Filter by Laboratory</span>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#151A23] border border-slate-800 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#0F111A] border-b border-slate-800">
          <div className="col-span-3 text-slate-400 text-sm font-medium">First Name</div>
          <div className="col-span-2 text-slate-400 text-sm font-medium">Last Name</div>
          <div className="col-span-3 text-slate-400 text-sm font-medium">Email</div>
          <div className="col-span-2 text-slate-400 text-sm font-medium">Grade</div>
          <div className="col-span-2 text-slate-400 text-sm font-medium"></div>
        </div>

        {/* Table Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading...</div>
          </div>
        ) : researchers.data.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">No researchers found</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {researchers.data.map((researcher) => (
              <div
                key={researcher.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#1E293B]/30 transition-colors"
              >
                {/* First Name with Avatar */}
                <div className="col-span-3 flex items-center space-x-3">
                  <img
                    src={getAvatarUrl(researcher.id)}
                    alt={researcher.prenom}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-white font-medium">{researcher.prenom}</div>
                    <div className="text-slate-400 text-xs">{getLabName(researcher.labo_id)}</div>
                  </div>
                </div>

                {/* Last Name */}
                <div className="col-span-2 flex items-center">
                  <span className="text-slate-200">{researcher.nom}</span>
                </div>

                {/* Email */}
                <div className="col-span-3 flex items-center">
                  <span className="text-slate-300 text-sm">{researcher.email}</span>
                </div>

                {/* Grade */}
                <div className="col-span-2 flex items-center">
                  <span className="text-slate-200">{researcher.grade}</span>
                </div>

                {/* View Profile Button */}
                <div className="col-span-2 flex items-center justify-end">
                  <button
                    onClick={() => onViewProfile(researcher.id)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-sm">Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="px-3 py-1 bg-[#1E293B] border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-slate-400 text-sm">
            of {researchers.total} researchers
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === 1
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:bg-[#1E293B] hover:text-white'
            }`}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
              disabled={pageNum === '...'}
              className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-colors ${
                pageNum === currentPage
                  ? 'bg-blue-600 text-white'
                  : pageNum === '...'
                  ? 'text-slate-500 cursor-default'
                  : 'text-slate-400 hover:bg-[#1E293B] hover:text-white'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-colors ${
              currentPage === totalPages
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:bg-[#1E293B] hover:text-white'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Add Researcher Modal */}
      <AddResearcherModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddResearcher}
      />
    </div>
  );
};