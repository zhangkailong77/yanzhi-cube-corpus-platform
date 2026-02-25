import React from 'react';
import { Briefcase, Target, Trophy, Lightbulb, Hash, Tag, BookOpen } from 'lucide-react';

interface CaseCardProps {
    caseData: {
        case_id: string;
        case_title: string;
        case_type?: string;
        background?: string;
        situation?: string;
        outcome?: string;
        conclusion?: string;
        tags?: string[];
    };
}

const CaseCard: React.FC<CaseCardProps> = ({ caseData }) => {
    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden group">
            {/* Header Section */}
            <div className="p-8 pb-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-indigo-100">
                                <BookOpen size={12} />
                                {caseData.case_type || 'Business Case'}
                            </span>
                            <span className="text-slate-400 text-xs font-mono">#{caseData.case_id}</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                            {caseData.case_title}
                        </h2>
                    </div>

                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500">
                        <Briefcase size={28} />
                    </div>
                </div>

                {/* Tags */}
                {caseData.tags && caseData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                        {caseData.tags.map((tag, idx) => (
                            <span key={idx} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-50 text-slate-500 text-[11px] font-semibold border border-slate-100 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-default">
                                <Tag size={10} />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Structured Content */}
            <div className="px-8 pb-8 space-y-6">
                {/* Background & Situation - Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Section
                        index={1}
                        icon={<Target className="text-blue-500" size={18} />}
                        label="Background (背景情境)"
                        content={caseData.background}
                        bgColor="bg-blue-50/30"
                    />
                    <Section
                        index={2}
                        icon={<Lightbulb className="text-purple-500" size={18} />}
                        label="Situation (执行举措)"
                        content={caseData.situation}
                        bgColor="bg-purple-50/30"
                    />
                </div>

                {/* Outcome - Highlighted */}
                <Section
                    index={3}
                    icon={<Trophy className="text-amber-500" size={18} />}
                    label="Outcome (核心成果)"
                    content={caseData.outcome}
                    bgColor="bg-amber-50/40"
                    isFullWidth
                    textStyle="text-slate-800 font-bold italic"
                />

                {/* Conclusion - Footer Style */}
                <div className="p-6 rounded-2xl bg-indigo-900 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group/conclusion">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/conclusion:scale-110 transition-transform">
                        <Lightbulb size={64} />
                    </div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">04. Conclusion & Insight (案例启示)</span>
                        <p className="mt-2 text-indigo-50 leading-relaxed font-medium">
                            {caseData.conclusion}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal Sub-component
const Section: React.FC<{
    index: number;
    icon: React.ReactNode;
    label: string;
    content?: string;
    bgColor: string;
    isFullWidth?: boolean;
    textStyle?: string;
}> = ({ index, icon, label, content, bgColor, isFullWidth, textStyle }) => {
    if (!content) return null;
    return (
        <div className={`${bgColor} rounded-2xl p-5 border border-white/50 ${isFullWidth ? 'w-full' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {index < 10 ? `0${index}` : index}. {label}
                </span>
            </div>
            <p className={`text-slate-600 text-sm leading-relaxed ${textStyle || ''}`}>
                {content}
            </p>
        </div>
    );
};

export default CaseCard;
