import React, { useState } from 'react';


interface AddResearcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (researcher: NewResearcher) => void;
}

interface NewResearcher {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  google_scholar_url: string;
  dblp_url: string;
  h_index: number;
  i_10_index: number;
  grade: string;
  labo_id: number | null;
}

const GRADES = [
  'Professeur',
  'Maitre Conference A',
  'Maitre Conference B',
  'Maitre Assistant A',
  'Maitre Assistant B',
];

const LABORATORIES = [
  { id: 1, name: 'Computer Science Lab' },
  { id: 2, name: 'Biology Research Center' },
  { id: 3, name: 'Physics Institute' },
  { id: 4, name: 'Chemistry Department' },
];

export const AddResearcherModal: React.FC<AddResearcherModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<NewResearcher>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    google_scholar_url: '',
    dblp_url: '',
    h_index: 0,
    i_10_index: 0,
    grade: '',
    labo_id: null,
  });

  const handleChange = (field: keyof NewResearcher, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      google_scholar_url: '',
      dblp_url: '',
      h_index: 0,
      i_10_index: 0,
      grade: '',
      labo_id: null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Add New Researcher</h2>
            <p className="text-slate-400">Enter the details for the new researcher below.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Row 1: Nom and Prénom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Nom (Last Name)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={formData.nom}
                    onChange={(e) => handleChange('nom', e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#0F111A] border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Prénom (First Name)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={formData.prenom}
                    onChange={(e) => handleChange('prenom', e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#0F111A] border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Email and Telephone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#0F111A] border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Telephone
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter telephone number"
                    value={formData.telephone}
                    onChange={(e) => handleChange('telephone', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0F111A] border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Row 3: Google Scholar URL and DBLP URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Google Scholar URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://scholar.google.com/..."
                    value={formData.google_scholar_url}
                    onChange={(e) => handleChange('google_scholar_url', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0F111A] border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    DBLP URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://dblp.org/pid/..."
                    value={formData.dblp_url}
                    onChange={(e) => handleChange('dblp_url', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0F111A] border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Row 4: H-Index, I-10 Index, Grade, Labo ID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    H-Index
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 42"
                    value={formData.h_index || ''}
                    onChange={(e) => handleChange('h_index', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-4 py-3 bg-[#0F111A] border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    I-10 Index
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 105"
                    value={formData.i_10_index || ''}
                    onChange={(e) => handleChange('i_10_index', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-4 py-3 bg-[#0F111A] border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Grade
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#0F111A] border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select grade</option>
                    {GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Labo ID
                  </label>
                  <select
                    value={formData.labo_id || ''}
                    onChange={(e) => handleChange('labo_id', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 bg-[#0F111A] border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select laboratory</option>
                    {LABORATORIES.map((lab) => (
                      <option key={lab.id} value={lab.id}>
                        {lab.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4 mt-10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Researcher
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};