import React from 'react';
import { Terminal, Send, CheckCircle2, Tag, BookOpen, Layers } from 'lucide-react';

interface ScenarioCardProps {
    scenarioData: {
        instruction_id: string;
        instruction_type?: string;
        task?: string;
        output?: string;
        tags?: string[];
    };
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenarioData }) => {
    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden group">
            {/* Header Section */}
            <div className="p-8 pb-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-100 shadow-sm shadow-blue-50">
                                <Layers size={12} />
                                {scenarioData.instruction_type || 'Instruction'}
                            </span>
                            <span className="text-slate-400 text-xs font-mono">#{scenarioData.instruction_id}</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                            Scenario-based Instruction
                        </h2>
                    </div>

                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner">
                        <Terminal size={28} />
                    </div>
                </div>

                {/* Tags */}
                {scenarioData.tags && scenarioData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                        {scenarioData.tags.map((tag, idx) => (
                            <span key={idx} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-50 text-slate-500 text-[11px] font-semibold border border-slate-100 hover:bg-white hover:border-blue-200 hover:text-blue-600 transition-all cursor-default shadow-sm">
                                <Tag size={10} />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="px-8 pb-8 space-y-6">
                {/* Task Section */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative group/task">
                    <div className="flex items-center gap-2 mb-3">
                        <Send size={16} className="text-blue-500" />
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                            01. TASK / PROMPT (指令要求)
                        </span>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
                        <p className="text-slate-700 text-sm leading-relaxed font-semibold">
                            {scenarioData.task}
                        </p>
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden group/output">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover/output:scale-110 transition-transform">
                        <CheckCircle2 size={84} className="text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 size={16} className="text-blue-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                02. EXPECTED OUTPUT (预期输出)
                            </span>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm">
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                {scenarioData.output}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioCard;
