import React from 'react';
import { Languages, Info, Hash, Globe, MousePointer2 } from 'lucide-react';

interface AlignmentCardProps {
    alignment: {
        alignment_id: string;
        source_text: string;
        target_text: string;
        context?: string;
        domain?: string;
    };
}

const AlignmentCard: React.FC<AlignmentCardProps> = ({ alignment }) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
            {/* Header Section */}
            <div className="px-8 py-4 bg-gradient-to-br from-emerald-50/50 to-white border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        <Languages size={12} />
                        Alignment Pair
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                        <Hash size={12} />
                        {alignment.alignment_id}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {alignment.domain && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                            <Globe size={12} className="text-slate-400" />
                            {alignment.domain}
                        </span>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                {/* Source Text */}
                <div className="p-8 space-y-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source (源)</span>
                    </div>
                    <p className="text-slate-800 text-lg leading-relaxed font-medium">
                        {alignment.source_text}
                    </p>
                </div>

                {/* Target Text */}
                <div className="p-8 space-y-4 bg-emerald-50/10 hover:bg-emerald-50/20 transition-colors">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Target (译)</span>
                    </div>
                    <p className="text-slate-900 text-lg leading-relaxed font-semibold">
                        {alignment.target_text}
                    </p>
                </div>
            </div>

            {/* Footer / Context */}
            {alignment.context && (
                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                        <Info size={14} className="text-slate-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Context (语境说明)</span>
                        <span className="text-sm text-slate-600 font-medium">{alignment.context}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlignmentCard;
