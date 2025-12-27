
import React, { useState } from 'react';
import { Company } from '../types';
import { Building2, Plus, Trash2, Globe, Check, RotateCcw } from 'lucide-react';

interface SettingsProps {
  companies: Company[];
  onAddCompany: (name: string, blogUrl: string) => void;
  onRemoveCompany: (id: string) => void;
  onResetDefaults: () => void;
}

const Settings: React.FC<SettingsProps> = ({ companies, onAddCompany, onRemoveCompany, onResetDefaults }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url) {
      onAddCompany(name, url);
      setName('');
      setUrl('');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleRemove = (id: string) => {
    if (deletingId === id) {
      onRemoveCompany(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3000); // Reset confirmation after 3s
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Sources & Preferences</h1>
          <p className="text-slate-500">Manage the company blogs and data sources for your industry ramp-up.</p>
        </div>
        <button 
          onClick={onResetDefaults}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-400 bg-white rounded-lg text-sm font-medium transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-8">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
              <Plus className="w-5 h-5 text-blue-600" />
              Add New Source
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Source Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Auth0"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Source URL</label>
                <input 
                  type="url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://auth0.com/blog"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-200"
              >
                {isSaved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {isSaved ? 'Successfully Added' : 'Track Source'}
              </button>
            </form>
          </section>
        </div>

        <div className="lg:col-span-7">
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Building2 className="w-5 h-5 text-blue-600" />
                Tracked Info Sources
              </h2>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                {companies.length} Sources
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {companies.map(c => (
                <div key={c.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="max-w-[200px] md:max-w-xs">
                      <h3 className="font-bold text-slate-900 truncate">{c.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                        <Globe className="w-3 h-3 flex-shrink-0" />
                        {c.blogUrl}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemove(c.id)}
                    className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
                      deletingId === c.id 
                        ? 'bg-red-600 text-white font-bold text-xs px-3' 
                        : 'text-slate-300 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {deletingId === c.id ? (
                      <>Confirm?</>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ))}
              {companies.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <p>No sources are currently being tracked.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
