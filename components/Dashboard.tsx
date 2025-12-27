
import React, { useMemo, useState, useEffect } from 'react';
import { Topic, Article } from '../types';
import { TOPICS } from '../constants';
import ArticleCard from './ArticleCard';
import { Loader2, TrendingUp, Sparkles, RotateCw, Clock } from 'lucide-react';

interface DashboardProps {
  articles: Article[];
  lastUpdated: number;
  onRefresh: () => Promise<void>;
  onToggleRead: (id: string) => void;
  onToggleSave: (article: Article) => void;
  readArticles: string[];
  savedArticles: Article[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  articles, 
  lastUpdated,
  onRefresh,
  onToggleRead, 
  onToggleSave, 
  readArticles, 
  savedArticles 
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial fetch if cache is empty
  useEffect(() => {
    if (articles.length === 0 && !isRefreshing && lastUpdated === 0) {
      handleRefresh();
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const newsWithStatus = useMemo(() => {
    return articles.map(a => ({
      ...a,
      isRead: readArticles.includes(a.id),
      isSaved: savedArticles.some(s => s.id === a.id)
    }));
  }, [articles, readArticles, savedArticles]);

  const getLastUpdatedText = () => {
    if (lastUpdated === 0) return 'Never';
    const mins = Math.floor((Date.now() - lastUpdated) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  if (articles.length === 0 && isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-500 font-medium">Curating your morning intelligence report...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500">Here's the latest across Security, AI, and IAM to keep you ahead of the curve.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Updated: {getLastUpdatedText()}
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 rounded-lg text-sm font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Intelligence'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {TOPICS.map(topic => (
          <section key={topic} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                {topic === Topic.SECURITY ? <TrendingUp className="w-5 h-5 text-blue-600" /> : <Sparkles className="w-5 h-5 text-blue-600" />}
              </div>
              <h2 className="text-xl font-bold text-slate-800">{topic}</h2>
            </div>
            <div className="space-y-4">
              {newsWithStatus.filter(n => n.topic === topic).length > 0 ? (
                newsWithStatus.filter(n => n.topic === topic).slice(0, 3).map(article => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    onToggleRead={onToggleRead} 
                    onToggleSave={onToggleSave}
                  />
                ))
              ) : (
                <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">
                  No recent news found.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
