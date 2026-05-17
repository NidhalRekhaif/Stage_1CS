import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, GripVertical } from 'lucide-react';
import { PublicationApi, PublicationCreate, PublicationUpdate } from '../api/PublicationApi';
import { RevueApi } from '../api/RevueApi';
import { ConferenceApi } from '../api/ConferenceApi';
import { ChercheurApi } from '../api/ChercheurApi';

interface Author {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  ordre?: number;
}

interface Props {
    mode: 'add' | 'edit';
}

const PublicationForm: React.FC<Props> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [publicationType, setPublicationType] = useState<'revue' | 'conference'>('revue');
  const [revues, setRevues] = useState<any[]>([]);
  const [conferences, setConferences] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Author[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [formData, setFormData] = useState({
    titre: mode === 'edit' ? "The Impact of AI on Modern Research Methodologies" : "",
    annee_publication: mode === 'edit' ? 2023 : new Date().getFullYear(),
    citations: mode === 'edit' ? 142 : 0,
    abstract: mode === 'edit' ? "This paper explores the transformative effects of artificial intelligence..." : "",
    doi: mode === 'edit' ? "10.1007/s11042-023-01742-8" : "",
    url: mode === 'edit' ? "https://example.com/publication/12345" : "",
    is_open_access: true,
    revue_id: null,
    conference_id: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revuesData, conferencesData] = await Promise.all([
          RevueApi.getAll(),
          ConferenceApi.getAll()
        ]);
        // Handle both paginated and flat array responses
        const revuesArray = Array.isArray(revuesData) ? revuesData : (revuesData as any).data || [];
        const conferencesArray = Array.isArray(conferencesData) ? conferencesData : (conferencesData as any).data || [];
        setRevues(revuesArray);
        setConferences(conferencesArray);
      } catch (err) {
        console.error('Failed to load revues and conferences');
      }
    };

    fetchData();
  }, []);

  // Search researchers
  useEffect(() => {
    const searchResearchers = async () => {
      const q = searchQuery.trim();
      if (!q) {
        setSearchResults([]);
        return;
      }

      try {
        // Try searching by nom and prenom to improve match coverage
        const [byNom, byPrenom] = await Promise.allSettled([
          ChercheurApi.getAll({ nom: q, limit: 100 }),
          ChercheurApi.getAll({ prenom: q, limit: 100 })
        ]);

        const extract = (res: PromiseSettledResult<any>) => {
          if (res.status !== 'fulfilled' || !res.value) return [];
          const payload = res.value;
          const arr = Array.isArray(payload) ? payload : (payload as any).data || [];
          return arr;
        };

        const listNom = extract(byNom);
        const listPrenom = extract(byPrenom);

        const merged: any[] = [];
        const seen = new Set<number>();
        for (const c of [...listNom, ...listPrenom]) {
          if (c && c.id && !seen.has(c.id)) {
            seen.add(c.id);
            merged.push(c);
          }
        }

        const results = merged.map((c: any) => ({ id: c.id, nom: c.nom, prenom: c.prenom, email: c.email }));
        setSearchResults(results);
      } catch (err) {
        console.error('Failed to search researchers', err);
        setSearchResults([]);
      }
    };

    searchResearchers();
  }, [searchQuery]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddAuthor = (researcher: Author) => {
    if (!selectedAuthors.find(a => a.id === researcher.id)) {
      setSelectedAuthors([...selectedAuthors, { ...researcher, ordre: selectedAuthors.length + 1 }]);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const handleRemoveAuthor = (id: number) => {
    setSelectedAuthors(selectedAuthors.filter(a => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Clean up the data - only send required and selected fields
      const cleanData: any = {
        titre: formData.titre,
        annee_publication: formData.annee_publication,
        citations: formData.citations || 0,
        is_open_access: formData.is_open_access,
      };
      
      // Add optional fields only if they have values
      if (formData.abstract) cleanData.abstract = formData.abstract;
      if (formData.doi) cleanData.doi = formData.doi;
      if (formData.url) cleanData.url = formData.url;
      
      // Add the selected publication ID
      if (publicationType === 'revue' && formData.revue_id) {
        cleanData.revue_id = formData.revue_id;
      } else if (publicationType === 'conference' && formData.conference_id) {
        cleanData.conference_id = formData.conference_id;
      }
      
      if (mode === 'add') {
        await PublicationApi.create(cleanData as PublicationCreate);
      } else if (id) {
        await PublicationApi.update(Number(id), cleanData as PublicationUpdate);
      }
      navigate('/publications');
    } catch (err) {
      console.error('Failed to save publication:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to save publication'}`);
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'add' ? 'Add Publication' : 'Edit Publication Details';
  const subTitle = mode === 'add' ? 'Fill in the details for the new publication.' : 'Make changes to the publication\'s information below.';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        {mode === 'edit' && (
             <div className="text-sm text-slate-400 mb-4">
             <span className="hover:text-white cursor-pointer" onClick={() => navigate('/publications')}>Publications</span> / <span className="hover:text-white cursor-pointer" onClick={() => navigate(`/publications/${id}`)}>Publication Details</span> / <span className="text-white">Edit</span>
         </div>
        )}

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-400">{subTitle}</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
        <InputGroup 
            label="Titre (Title)" 
            placeholder="Enter publication title" 
            value={formData.titre}
            onChange={(e) => handleInputChange('titre', e.target.value)}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup 
                label="Annee Publication (Publication Year)" 
                placeholder="e.g., 2023" 
                type="number"
                value={formData.annee_publication}
                onChange={(e) => handleInputChange('annee_publication', Number(e.target.value))}
            />
            <InputGroup 
                label="Citations" 
                placeholder="e.g., 120" 
                type="number"
                value={formData.citations}
                onChange={(e) => handleInputChange('citations', Number(e.target.value))}
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-white">Abstract</label>
            <textarea 
                className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors min-h-[120px]"
                placeholder="Enter a brief summary of the publication..."
                value={formData.abstract}
                onChange={(e) => handleInputChange('abstract', e.target.value)}
            ></textarea>
        </div>

        {mode === 'add' && (
            <div className="space-y-4">
                <label className="text-sm font-medium text-white">Researchers / Authors</label>
                <p className="text-xs text-slate-400 -mt-1">Search for researchers and define their author order.</p>
                
                <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search by name, email, or researcher ID..." 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchResults(true);
                      }}
                      onFocus={() => setShowSearchResults(true)}
                      className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 pl-10" 
                    />
                    <span className="absolute left-3 top-3.5 text-slate-500">🔍</span>
                    
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                        {searchResults.map(researcher => (
                          <button
                            key={researcher.id}
                            onClick={() => handleAddAuthor(researcher)}
                            disabled={selectedAuthors.some(a => a.id === researcher.id)}
                            className="w-full text-left px-4 py-2 hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <p className="text-white font-medium">{researcher.prenom} {researcher.nom}</p>
                            <p className="text-xs text-slate-500">{researcher.email || 'No email'}</p>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                <div className="space-y-2">
                    {selectedAuthors.map((author, index) => (
                      <AuthorRow 
                        key={author.id}
                        author={author}
                        index={index}
                        onRemove={() => handleRemoveAuthor(author.id)}
                      />
                    ))}
                    {selectedAuthors.length === 0 && (
                      <p className="text-sm text-slate-500 py-4 text-center">No researchers added yet. Search and select to add authors.</p>
                    )}
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="DOI" placeholder="10.1000/xyz123" value={formData.doi} onChange={(e) => handleInputChange('doi', e.target.value)} />
            <InputGroup label="URL" placeholder="https://example.com/publication" value={formData.url} onChange={(e) => handleInputChange('url', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
             <div className="space-y-2">
                <label className="text-sm font-medium text-white">Type</label>
                 <select value={publicationType} onChange={(e) => setPublicationType(e.target.value as 'revue' | 'conference')} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 appearance-none">
                    <option value="revue">Journal (Revue)</option>
                    <option value="conference">Conference</option>
                 </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-white">{publicationType === 'revue' ? 'Journal' : 'Conference'}</label>
                 <select value={publicationType === 'revue' ? (formData.revue_id || '') : (formData.conference_id || '')} onChange={(e) => handleInputChange(publicationType === 'revue' ? 'revue_id' : 'conference_id', e.target.value ? Number(e.target.value) : null)} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 appearance-none">
                    <option value="">Select {publicationType === 'revue' ? 'Journal' : 'Conference'}</option>
                    {(publicationType === 'revue' ? revues : conferences).map(item => (
                      <option key={item.id} value={item.id}>{item.nom}</option>
                    ))}
                 </select>
            </div>

             <div className="space-y-2 pb-3">
                <label className="text-sm font-medium text-white block mb-2">Is Open Access</label>
                <div className="flex items-center gap-3">
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" checked={formData.is_open_access} onChange={(e) => handleInputChange('is_open_access', e.target.checked)} />
                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-blue-600 cursor-pointer"></label>
                    </div>
                    <span className="text-white text-sm">{formData.is_open_access ? 'Enabled' : 'Disabled'}</span>
                </div>
            </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Saving...' : (mode === 'add' ? 'Add Publication' : 'Save Changes')}
        </button>
        </form>
      </div>
    </div>
  );
};

const InputGroup = ({ label, placeholder, value, onChange, defaultValue, type = 'text' }: { label: string, placeholder: string, value?: string | number, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, defaultValue?: string, type?: string }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-white">{label}</label>
        <input 
            type={type}
            placeholder={placeholder} 
            value={value !== undefined ? value : ''}
            onChange={onChange || (() => {})}
            className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
        />
    </div>
);

const AuthorRow = ({ author, index, onRemove }: { author: { id: number; nom: string; prenom?: string; email?: string; ordre?: number }, index: number, onRemove: () => void }) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <GripVertical className="text-slate-600 cursor-move" size={20} />
        <div>
          <p className="text-white font-medium">{author.prenom} {author.nom}</p>
          <p className="text-xs text-slate-500">{author.email || 'No email'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">#{index + 1}</span>
        <button onClick={onRemove} className="text-slate-500 hover:text-red-400">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default PublicationForm;
