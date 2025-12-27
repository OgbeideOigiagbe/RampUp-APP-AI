
import React, { useState, useEffect, useCallback } from 'react';
import { Company, Article, AppState, Topic } from './types';
import { DEFAULT_COMPANIES, STORAGE_KEY_LEGACY, STORAGE_KEY_SETTINGS, STORAGE_KEY_CACHE, TOPICS } from './constants';
import { fetchGlobalIndustryNews, fetchCompanyBlogs } from './services/geminiService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CompanyView from './components/CompanyView';
import Settings from './components/Settings';
import ArticleCard from './components/ArticleCard';
import { BookmarkCheck } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('home');
  const [state, setState] = useState<AppState>(() => {
    try {
      // 1. Try to load from the new split storage
      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      const savedCache = localStorage.getItem(STORAGE_KEY_CACHE);

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        const parsedCache = savedCache ? JSON.parse(savedCache) : {};

        return {
          companies: parsedSettings.companies || DEFAULT_COMPANIES,
          readArticles: parsedSettings.readArticles || [],
          savedArticles: parsedSettings.savedArticles || [],
          globalNews: parsedCache.globalNews || { articles: [], lastUpdated: 0 },
          companyNews: parsedCache.companyNews || {}
        };
      }

      // 2. Fallback: Try migration from legacy single-key storage
      const legacy = localStorage.getItem(STORAGE_KEY_LEGACY);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return {
          companies: parsed.companies || DEFAULT_COMPANIES,
          readArticles: parsed.readArticles || [],
          savedArticles: parsed.savedArticles || [],
          globalNews: parsed.globalNews || { articles: [], lastUpdated: 0 },
          companyNews: parsed.companyNews || {}
        };
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }

    // 3. Default State
    return {
      companies: DEFAULT_COMPANIES,
      readArticles: [],
      savedArticles: [],
      globalNews: { articles: [], lastUpdated: 0 },
      companyNews: {}
    };
  });

  // Robust Persistence: Split saving to ensure settings are never lost due to cache quota
  useEffect(() => {
    // Save Critical Settings
    try {
      const settingsData = {
        companies: state.companies,
        readArticles: state.readArticles,
        savedArticles: state.savedArticles
      };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settingsData));
    } catch (e) {
      console.error("CRITICAL: Failed to save settings", e);
      alert("Warning: Browser storage is full. Your company list changes may not be saved.");
    }

    // Save Data Cache (Fail silently if full)
    try {
      const cacheData = {
        globalNews: state.globalNews,
        companyNews: state.companyNews
      };
      localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(cacheData));
    } catch (e) {
      console.warn("Failed to save news cache - quota exceeded likely", e);
      // We do not alert here because losing cache is acceptable, losing settings is not.
    }
  }, [state]);

  const handleToggleRead = useCallback((id: string) => {
    setState(prev => {
      const isRead = prev.readArticles.includes(id);
      return {
        ...prev,
        readArticles: isRead 
          ? prev.readArticles.filter(aid => aid !== id)
          : [...prev.readArticles, id]
      };
    });
  }, []);

  const handleToggleSave = useCallback((article: Article) => {
    setState(prev => {
      const isSaved = prev.savedArticles.some(a => a.id === article.id);
      return {
        ...prev,
        savedArticles: isSaved
          ? prev.savedArticles.filter(a => a.id !== article.id)
          : [{ ...article, isSaved: true }, ...prev.savedArticles]
      };
    });
  }, []);

  const handleAddCompany = (name: string, url: string) => {
    const newId = Date.now().toString();
    const newCompany = { id: newId, name, blogUrl: url };
    
    setState(prev => ({
      ...prev,
      companies: [...prev.companies, newCompany]
    }));

    // UX Improvement: Auto-navigate to the new company
    // This triggers the CompanyView to mount -> detects empty cache -> triggers fetch -> populates cache
    setActiveView(`company-${newId}`);
  };

  const handleRemoveCompany = (id: string) => {
    setState(prev => {
      const newCompanyNews = { ...prev.companyNews };
      delete newCompanyNews[id]; // Clear cache for deleted company
      return {
        ...prev,
        companies: prev.companies.filter(c => c.id !== id),
        companyNews: newCompanyNews
      };
    });
    
    if (activeView === `company-${id}`) {
      setActiveView('home');
    }
  };

  const handleResetToDefaults = () => {
    if (confirm("Reset to default companies? This will clear your custom company list.")) {
      setState(prev => ({
        ...prev,
        companies: DEFAULT_COMPANIES,
        companyNews: {} // Clear cache on reset
      }));
      setActiveView('home');
    }
  };

  // Data Fetching Handlers
  const refreshGlobalNews = async () => {
    const results = await Promise.all(TOPICS.map(topic => fetchGlobalIndustryNews(topic)));
    const articles = results.flat();
    setState(prev => ({
      ...prev,
      globalNews: {
        articles,
        lastUpdated: Date.now()
      }
    }));
  };

  const refreshCompanyNews = async (company: Company) => {
    const results = await Promise.all(TOPICS.map(topic => fetchCompanyBlogs(company, topic)));
    const articles = results.flat();
    setState(prev => ({
      ...prev,
      companyNews: {
        ...prev.companyNews,
        [company.id]: {
          articles,
          lastUpdated: Date.now()
        }
      }
    }));
  };

  const renderContent = () => {
    if (activeView === 'home') {
      return (
        <Dashboard 
          articles={state.globalNews.articles}
          lastUpdated={state.globalNews.lastUpdated}
          onRefresh={refreshGlobalNews}
          onToggleRead={handleToggleRead} 
          onToggleSave={handleToggleSave} 
          readArticles={state.readArticles}
          savedArticles={state.savedArticles}
        />
      );
    }

    if (activeView === 'settings') {
      return (
        <Settings 
          companies={state.companies} 
          onAddCompany={handleAddCompany} 
          onRemoveCompany={handleRemoveCompany}
          onResetDefaults={handleResetToDefaults}
        />
      );
    }

    if (activeView === 'saved') {
      return (
        <div className="max-w-7xl mx-auto py-8">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Read Later</h1>
            <p className="text-slate-500">Pick up where you left off in your industry research.</p>
          </header>
          {state.savedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.savedArticles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={{...article, isRead: state.readArticles.includes(article.id), isSaved: true}} 
                  onToggleRead={handleToggleRead}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No articles saved yet. Browse your feeds to find interesting reads!</p>
            </div>
          )}
        </div>
      );
    }

    if (activeView.startsWith('company-')) {
      const companyId = activeView.split('-')[1];
      const company = state.companies.find(c => c.id === companyId);
      const companyCache = state.companyNews[companyId];
      
      if (company) {
        return (
          <CompanyView 
            company={company}
            companyArticles={companyCache?.articles || []}
            companyLastUpdated={companyCache?.lastUpdated || 0}
            globalArticles={state.globalNews.articles}
            onRefreshCompany={() => refreshCompanyNews(company)}
            onToggleRead={handleToggleRead}
            onToggleSave={handleToggleSave}
            readArticles={state.readArticles}
            savedArticles={state.savedArticles}
          />
        );
      }
    }

    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-slate-500 font-medium">This source is no longer being tracked.</p>
        <button 
          onClick={() => setActiveView('home')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold"
        >
          Return Home
        </button>
      </div>
    );
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar 
        companies={state.companies} 
        activeView={activeView} 
        onNavigate={setActiveView} 
      />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="px-8 max-w-screen-2xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
