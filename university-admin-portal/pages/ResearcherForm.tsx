import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Props {
    mode: 'add' | 'edit';
}

const ResearcherForm: React.FC<Props> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();

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
        
        {/* Personal Information Section */}
        {mode === 'edit' && <h3 className="text-xl font-bold text-white mb-4">Personal Information</h3>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Nom (Last Name)" placeholder="Enter last name" defaultValue={mode === 'edit' ? "Reed" : ""} />
            <InputGroup label="Prénom (First Name)" placeholder="Enter first name" defaultValue={mode === 'edit' ? "Evelyn" : ""} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Email" placeholder="Enter email address" defaultValue={mode === 'edit' ? "evelyn.reed@university.edu" : ""} />
            <InputGroup label="Telephone" placeholder="Enter telephone number" defaultValue={mode === 'edit' ? "+1 (555) 123-4567" : ""} />
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
                <select className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                    <option>Select grade</option>
                    <option selected={mode==='edit'}>Professor</option>
                    <option>Associate Professor</option>
                </select>
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-white">Labo ID / Laboratory</label>
                <select className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                    <option>Select laboratory</option>
                    <option selected={mode==='edit'}>Computational Sciences Institute</option>
                </select>
            </div>
        </div>

        {/* Links */}
        {mode === 'edit' && <h3 className="text-xl font-bold text-white mt-8 mb-4">Online Profiles & Links</h3>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Google Scholar URL" placeholder="https://scholar.google.com/..." defaultValue={mode==='edit' ? 'https://scholar.google.com/citations?user=xyzABC' : ''} />
            <InputGroup label="DBLP URL" placeholder="https://dblp.org/pid/..." defaultValue={mode==='edit' ? 'https://dblp.org/pid/123/4567' : ''} />
        </div>

        {/* Indices */}
        {mode === 'edit' && <h3 className="text-xl font-bold text-white mt-8 mb-4">Publication Metrics</h3>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <InputGroup label="H-Index" placeholder="e.g., 42" defaultValue={mode==='edit' ? '32' : ''} />
            <InputGroup label="I-10 Index" placeholder="e.g., 105" defaultValue={mode==='edit' ? '58' : ''} />
            {mode === 'edit' && (
                <>
                 <InputGroup label="Total Publications" placeholder="" defaultValue="53" />
                 <InputGroup label="Total Citations" placeholder="" defaultValue="2148" />
                </>
            )}
        </div>

      </div>

      <div className="flex justify-end gap-4">
        <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors font-medium"
        >
            Cancel
        </button>
        <button className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-bold">
            {mode === 'add' ? 'Add Researcher' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

const InputGroup = ({ label, placeholder, defaultValue }: { label: string, placeholder: string, defaultValue?: string }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-white">{label}</label>
        <input 
            type="text" 
            placeholder={placeholder} 
            defaultValue={defaultValue}
            className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
        />
    </div>
);

export default ResearcherForm;
