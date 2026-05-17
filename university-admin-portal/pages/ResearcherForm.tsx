import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChercheurApi, ChercheurCreate, ChercheurUpdate } from '../api/ChercheurApi';
import { LaboApi } from '../api/LaboApi';

interface Props {
    mode: 'add' | 'edit';
}

const ResearcherForm: React.FC<Props> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [labs, setLabs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nom: mode === 'edit' ? "Reed" : "",
    prenom: mode === 'edit' ? "Evelyn" : "",
    email: mode === 'edit' ? "evelyn.reed@university.edu" : "",
    labo_id: null
  });

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const data = await LaboApi.getAll();
        if ('data' in data) {
          setLabs(data.data);
        } else {
          setLabs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load laboratories');
      }
    };

    fetchLabs();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (mode === 'add') {
        await ChercheurApi.create(formData as ChercheurCreate);
      } else if (id) {
        await ChercheurApi.update(Number(id), formData as ChercheurUpdate);
      }
      navigate('/researchers');
    } catch (err) {
      console.error('Failed to save researcher:', err);
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'add' ? 'Add New Researcher' : 'Edit Profile: Dr. Evelyn Reed';
  const subTitle = mode === 'add' ? 'Enter the details for the new researcher below.' : '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        {mode === 'edit' && (
             <div className="text-sm text-slate-400 mb-4">
             <span className="hover:text-white cursor-pointer" onClick={() => navigate('/researchers')}>Researchers</span> / <span className="hover:text-white cursor-pointer" onClick={() => navigate(`/researchers/${id}`)}>Dr. Evelyn Reed</span> / <span className="text-white">Edit Profile</span>
         </div>
        )}

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        {subTitle && <p className="text-slate-400">{subTitle}</p>}
      </div>

      {/* Profile Picture Mock for Edit */}
      {mode === 'edit' && (
          <div className="flex items-center gap-6 py-4">
              <img src="https://picsum.photos/200/200" className="w-24 h-24 rounded-full object-cover border-2 border-slate-700" alt="Profile" />
              <div>
                  <h3 className="text-white font-bold text-lg">Profile Picture</h3>
                  <p className="text-slate-400 text-sm mb-3">Upload a new photo for the researcher.</p>
                  <label className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors">
                      Upload New Photo
                      <input type="file" className="hidden" />
                  </label>
              </div>
          </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        {mode === 'edit' && <h3 className="text-xl font-bold text-white mb-4">Personal Information</h3>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Nom (Last Name)" placeholder="Enter last name" value={formData.nom} onChange={(e) => handleInputChange('nom', e.target.value)} />
            <InputGroup label="Prénom (First Name)" placeholder="Enter first name" value={formData.prenom} onChange={(e) => handleInputChange('prenom', e.target.value)} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Email" placeholder="Enter email address" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
            <InputGroup label="Telephone" placeholder="Enter telephone number" value={mode === 'edit' ? "+1 (555) 123-4567" : ""} onChange={() => {}} />
        </div>

        {mode === 'edit' && (
            <div className="space-y-2">
                <label className="text-sm font-medium text-white">Biographical Details</label>
                <textarea 
                    className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors min-h-[100px]"
                    defaultValue="Dr. Evelyn Reed is a leading researcher in computational linguistics..."
                ></textarea>
            </div>
        )}

        {/* Academic Details - Visual separation for Edit mode */}
        {mode === 'edit' && <h3 className="text-xl font-bold text-white mt-8 mb-4">Academic & Professional Details</h3>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-white">Grade / Position</label>
                <select className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none" defaultValue={mode==='edit' ? 'professor' : ''}>
                    <option value="">Select grade</option>
                    <option value="professor">Professor</option>
                    <option value="associate">Associate Professor</option>
                </select>
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-white">Labo ID / Laboratory</label>
                <select value={formData.labo_id || ''} onChange={(e) => handleInputChange('labo_id', e.target.value ? Number(e.target.value) : null)} className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                    <option value="">Select laboratory</option>
                    {labs.map(lab => (
                      <option key={lab.id} value={lab.id}>{lab.nom}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Links */}
        {mode === 'edit' && <h3 className="text-xl font-bold text-white mt-8 mb-4">Online Profiles & Links</h3>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Google Scholar URL" placeholder="https://scholar.google.com/..." value={mode==='edit' ? 'https://scholar.google.com/citations?user=xyzABC' : ''} onChange={() => {}} />
            <InputGroup label="DBLP URL" placeholder="https://dblp.org/pid/..." value={mode==='edit' ? 'https://dblp.org/pid/123/4567' : ''} onChange={() => {}} />
        </div>

        {/* Indices */}
        {mode === 'edit' && <h3 className="text-xl font-bold text-white mt-8 mb-4">Publication Metrics</h3>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <InputGroup label="H-Index" placeholder="e.g., 42" value={mode==='edit' ? '32' : ''} onChange={() => {}} />
            <InputGroup label="I-10 Index" placeholder="e.g., 105" value={mode==='edit' ? '58' : ''} onChange={() => {}} />
            {mode === 'edit' && (
                <>
                 <InputGroup label="Total Publications" placeholder="" value="53" onChange={() => {}} />
                 <InputGroup label="Total Citations" placeholder="" value="2148" onChange={() => {}} />
                </>
            )}
        </div>

        <div className="flex justify-end gap-4">
          <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors font-medium"
          >
              Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium transition-colors"
          >
            {loading ? 'Saving...' : (mode === 'add' ? 'Add Researcher' : 'Save Changes')}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};

const InputGroup = ({ label, placeholder, value, onChange, defaultValue }: { label: string, placeholder: string, value?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, defaultValue?: string }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-white">{label}</label>
        <input 
            type="text" 
            placeholder={placeholder} 
            value={value !== undefined ? value : ''}
            onChange={onChange || (() => {})}
            className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
        />
    </div>
);

export default ResearcherForm;
