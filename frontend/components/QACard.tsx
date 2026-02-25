import React from 'react';
import { HelpCircle, MessageSquare, Hash, Tag, Layers, Key } from 'lucide-react';

interface QACardProps {
    qa: {
        qa_id: string;
        question: string;
        question_type?: string;
        answer: string;
        keywords: string[];
        category: string;
        tags: string[];
    };
}

const QACard: React.FC<QACardProps> = ({ qa }) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
            {/* Header Section */}
            <div className="px-8 py-6 bg-gradient-to-br from-indigo-50/50 to-white border-b border-slate-50 relative">
                <div className="absolute top-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <HelpCircle size={48} className="text-indigo-600" />
                </div>

                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                                Question
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-relaxed">
                                {qa.question}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mt-2">
                            <Hash size={14} className="text-indigo-400" />
                            <span className="font-mono">{qa.qa_id}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
                            <Layers size={14} className="text-purple-400" />
                            <span>{qa.question_type || '通用'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
                            <Tag size={14} className="text-emerald-400" />
                            <span>{qa.category}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Answer Section */}
            <div className="p-8 space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <MessageSquare size={18} />
                        </div>
                        <h4>回答 (Answer)</h4>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <p className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                            {qa.answer}
                        </p>
                    </div>
                </div>

                {/* Keywords & Tags Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Keywords */}
                    {qa.keywords && qa.keywords.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-700 text-sm font-bold">
                                <Key size={16} className="text-amber-500" />
                                <h5>关键词 (Keywords)</h5>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {qa.keywords.map((kw, idx) => (
                                    <span key={idx} className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100/50">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {qa.tags && qa.tags.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-700 text-sm font-bold">
                                <Tag size={16} className="text-blue-500" />
                                <h5>标签 (Tags)</h5>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {qa.tags.map((tag, idx) => (
                                    <span key={idx} className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100/50">
                                        #{tag}
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

export default QACard;
