import React from 'react';
import { Book, Languages, Hash, Tag, Info, List as ListIcon, Star } from 'lucide-react';

interface TerminologyCardProps {
  term: {
    term_id: string;
    term: string;
    abbreviation?: string;
    category: string;
    definition: string;
    examples: string[];
    related_terms: string[];
    translations: Record<string, string>;
    tags: string[];
  };
}

const TerminologyCard: React.FC<TerminologyCardProps> = ({ term }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
      {/* Header Section */}
      <div className="px-8 py-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-50 relative">
        <div className="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Book size={48} className="text-primary-600" />
        </div>
        
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {term.term}
              </h3>
              {term.abbreviation && (
                <span className="px-2.5 py-0.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider border border-primary-100">
                  {term.abbreviation}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <Hash size={14} className="text-primary-500" />
              <span className="font-mono">{term.term_id}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
              <Tag size={14} className="text-emerald-500" />
              <span>{term.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 space-y-8">
        {/* Definition */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Info size={18} />
            </div>
            <h4>定义 (Definition)</h4>
          </div>
          <p className="text-slate-600 leading-relaxed text-base pl-10">
            {term.definition}
          </p>
        </div>

        {/* Translations Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Languages size={18} />
            </div>
            <h4>多语对应 (Translations)</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-10">
            {Object.entries(term.translations).map(([lang, text]) => (
              <div key={lang} className="flex flex-col p-3 rounded-2xl bg-slate-50 border border-slate-100 group/lang hover:bg-white hover:border-primary-200 hover:shadow-sm transition-all">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover/lang:text-primary-500 transition-colors">
                  {lang}
                </span>
                <span className="text-slate-800 font-medium">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Examples */}
        {term.examples && term.examples.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <ListIcon size={18} />
              </div>
              <h4>例句 (Examples)</h4>
            </div>
            <div className="space-y-3 pl-10">
              {term.examples.map((example, idx) => (
                <div key={idx} className="relative pl-6 py-2 border-l-2 border-slate-100 hover:border-primary-300 transition-colors">
                  <div className="absolute -left-[5px] top-4 w-2 h-2 rounded-full bg-slate-200"></div>
                  <p className="text-slate-600 text-sm italic leading-relaxed">
                    "{example}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer: Tags & Related */}
        <div className="pt-6 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {term.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-default">
                #{tag}
              </span>
            ))}
          </div>
          
          {term.related_terms && term.related_terms.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">相关内容:</span>
              <div className="flex gap-2">
                {term.related_terms.map(related => (
                  <span key={related} className="text-xs font-medium text-primary-600 hover:underline cursor-pointer">
                    {related}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminologyCard;
