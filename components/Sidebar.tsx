
import React from 'react';
import { Company } from '../types';
import { Home, Settings, Building2, Plus, BookmarkCheck } from 'lucide-react';

interface SidebarProps {
  companies: Company[];
  activeView: string;
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ companies, activeView, onNavigate }) => {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">R</div>
          <h1 className="text-xl font-bold tracking-tight">RampUp Intel</h1>
        </div>

        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeView === 'home' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Home className="w-4 h-4" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('saved')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeView === 'saved' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span className="font-medium">Read Later</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeView === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium">Settings</span>
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex items-center justify-between px-2 py-4 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">My Info Sources</span>
        </div>
        <div className="space-y-1">
          {companies.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => onNavigate(`company-${c.id}`)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeView === `company-${c.id}` ? 'bg-slate-800 text-blue-400 border border-slate-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Building2 className="w-4 h-4" />
              <span className="font-medium truncate">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button 
          type="button"
          onClick={() => onNavigate('settings')}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Info Source
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
