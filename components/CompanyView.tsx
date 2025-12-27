
import React, { useState, useMemo, useEffect } from 'react';
import { Company, Topic, Article } from '../types';
import { TOPICS } from '../constants';
import ArticleCard from './ArticleCard';
import { Loader2, Globe, Building, Search, RotateCw, Clock } from 'lucide-react';

interface CompanyViewProps {
  company: Company;
  companyArticles: Article[];
  companyLastUpdated: number;
  globalArticles: Article[];
  onRefreshCompany: () => Promise<void>;
  onToggleRead: (id: string) => void;
  onToggleSave: (article: Article) => void;
  readArticles: string[];
  savedArticles: Article[];
}

const CompanyView: React.FC<CompanyViewProps> = ({ 
  company, 
  companyArticles,
  companyLastUpdated,
  globalArticles,
  onRefreshCompany,
  onToggleRead, 
  onToggleSave, 
  readArticles, 
  savedArticles 
}) => {
  const [activeTab, setActiveTab] = useState<'blogs' | 'global'>('blogs');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial fetch if cache is empty for this company
  useEffect(() => {
    if (companyArticles.length === 0 && !isRefreshing && companyLastUpdated === 0) {
      handleRefresh();
    }
  }, [company.id]); // trigger when company changes if no data

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshCompany();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper to inject current status into raw articles
  const injectStatus = (articles: Article[]) => articles.map(a => ({
    ...a,
    isRead: readArticles.includes(a.id),
    isSaved: savedArticles.some(s => s.id === a.id)
  }));

  const blogsWithStatus = useMemo(() => injectStatus(companyArticles), [companyArticles, readArticles, savedArticles]);
  const globalWithStatus = useMemo(() => injectStatus(globalArticles), [globalArticles, readArticles, savedArticles]);

  const getLastUpdatedText = () => {
    if (companyLastUpdated === 0) return 'Never';
    const mins = Math.floor((Date.now() - companyLastUpdated) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  if (companyArticles.length === 0 && isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-500 font-medium">Scanning {company.name}'s publications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                <Building className="w-6 h-6 text-slate-500" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
            </div>
            <p className="text-slate-500 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {company.blogUrl}
            </p>
          </div>
          <div className="flex items-center gap-4">
             {activeTab === 'blogs' && (
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Data Freshness</span>
                  <span className="text-xs font-medium text-slate-600">{getLastUpdatedText()}</span>
                </div>
             )}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setActiveTab('blogs')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'blogs' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Company Blogs
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('global')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'global' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Global Industry
              </button>
            </div>
            {activeTab === 'blogs' && (
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 rounded-lg transition-all shadow-sm disabled:opacity-50"
                title="Refresh Company Data"
              >
                <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </header>

      {activeTab === 'blogs' ? (
        <div className="space-y-12">
          {TOPICS.map(topic => (
            <section key={topic}>
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                {topic}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogsWithStatus.filter(b => b.topic === topic).length > 0 ? (
                  blogsWithStatus.filter(b => b.topic === topic).map(article => (
                    <ArticleCard 
                      key={article.id} 
                      article={article} 
                      onToggleRead={onToggleRead}
                      onToggleSave={onToggleSave}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 italic">No blogs found for {topic}. Try refreshing.</p>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {TOPICS.map(topic => (
            <section key={topic} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6 px-2">{topic}</h2>
              <div className="space-y-4">
                {globalWithStatus.filter(n => n.topic === topic).length > 0 ? (
                  globalWithStatus.filter(n => n.topic === topic).map(article => (
                    <ArticleCard 
                      key={article.id} 
                      article={article} 
                      onToggleRead={onToggleRead}
                      onToggleSave={onToggleSave}
                    />
                  ))
                ) : (
                   <div className="p-4 text-center text-slate-400 text-sm italic">
                     No global news cached. Check the Dashboard to update.
                   </div>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyView;
