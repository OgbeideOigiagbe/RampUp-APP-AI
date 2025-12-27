
import React from 'react';
import { Article } from '../types';
import { Bookmark, CheckCircle, ExternalLink, Clock } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onToggleRead: (id: string) => void;
  onToggleSave: (article: Article) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onToggleRead, onToggleSave }) => {
  return (
    <div className={`group relative bg-white border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${article.isRead ? 'opacity-70 grayscale-[0.5]' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-3">
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700">
          {article.topic}
        </span>
        <div className="flex space-x-2">
          <button 
            onClick={() => onToggleSave(article)}
            className={`p-1.5 rounded-full transition-colors ${article.isSaved ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-50'}`}
            title={article.isSaved ? "Saved" : "Save for later"}
          >
            <Bookmark className="w-4 h-4" fill={article.isSaved ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={() => onToggleRead(article.id)}
            className={`p-1.5 rounded-full transition-colors ${article.isRead ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-green-600 hover:bg-slate-50'}`}
            title={article.isRead ? "Mark as unread" : "Mark as read"}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors">
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          {article.title}
          <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </h3>

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 mt-2">
        <span className="font-medium text-slate-700">{article.source}</span>
        {article.publishedDate && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.publishedDate}
          </span>
        )}
      </div>

      <ul className="space-y-2 mb-2">
        {article.summary.map((point, idx) => (
          <li key={idx} className="text-sm text-slate-600 flex items-start gap-2 leading-relaxed">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArticleCard;
