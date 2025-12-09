import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, GripVertical } from 'lucide-react';

interface Props {
    mode: 'add' | 'edit';
}

const PublicationForm: React.FC<Props> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();

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
        
        <InputGroup 
            label="Titre (Title)" 
            placeholder="Enter publication title" 
            defaultValue={mode==='edit' ? "The Impact of AI on Modern Research Methodologies" : ""} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup 
                label="Annee Publication (Publication Year)" 
                placeholder="e.g., 2023" 
                defaultValue={mode==='edit' ? "2023" : ""} 
            />
            <InputGroup 
                label="Citations" 
                placeholder="e.g., 120" 
                defaultValue={mode==='edit' ? "142" : ""} 
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium text-white">Abstract</label>
            <textarea 
                className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors min-h-[120px]"
                placeholder="Enter a brief summary of the publication..."
                defaultValue={mode==='edit' ? "This paper explores the transformative effects of artificial intelligence..." : ""}
            ></textarea>
        </div>

        {mode === 'add' && (
            <div className="space-y-4">
                <label className="text-sm font-medium text-white">Researchers / Authors</label>
                <p className="text-xs text-slate-400 -mt-1">Search for researchers and define their author order.</p>
                
                <div className="relative">
                    <input type="text" placeholder="Search by name, email, or researcher ID..." className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 pl-10" />
                    <span className="absolute left-3 top-3.5 text-slate-500">🔍</span>
                </div>

                <div className="space-y-2">
                    <AuthorRow name="Dr. Jane Doe" email="jane.doe@university.edu" role="First Author" />
                    <AuthorRow name="Dr. John Smith" email="john.smith@university.edu" role="Middle Author" />
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="DOI" placeholder="10.1000/xyz123" defaultValue={mode==='edit' ? "10.1007/s11042-023-01742-8" : ""} />
            <InputGroup label="URL" placeholder="https://example.com/publication" defaultValue={mode==='edit' ? "https://example.com/publication/12345" : ""} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
             <div className="space-y-2">
                <label className="text-sm font-medium text-white">Journal / Conference</label>
                 <select className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 appearance-none">
                    <option selected={mode==='edit'}>International Conference on AI</option>
                    <option>Other Journal</option>
                 </select>
            </div>
            
             <div className="space-y-2 pb-3">
                <label className="text-sm font-medium text-white block mb-2">Is Open Access</label>
                <div className="flex items-center gap-3">
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" checked={true} />
                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-blue-600 cursor-pointer"></label>
                    </div>
                    <span className="text-white text-sm">Enabled</span>
                </div>
            </div>
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
            {mode === 'add' ? 'Add Publication' : 'Save Changes'}
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

const AuthorRow = ({ name, email, role }: { name: string, email: string, role: string }) => (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <GripVertical className="text-slate-600 cursor-move" size={20} />
            <div>
                <p className="text-white font-medium">{name}</p>
                <p className="text-xs text-slate-500">{email}</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <select className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded p-1">
                <option>{role}</option>
            </select>
            <button className="text-slate-500 hover:text-red-400">
                <Trash2 size={16} />
            </button>
        </div>
    </div>
)

export default PublicationForm;
