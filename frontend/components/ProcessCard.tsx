import React from 'react';
import { ClipboardCheck, PlayCircle, AlertCircle, CheckCircle2, Hash, Layers } from 'lucide-react';

interface ProcessCardProps {
    process: {
        rule_id: string;
        scenario: string;
        condition: string;
        result: string;
        category?: string;
    };
}

const ProcessCard: React.FC<ProcessCardProps> = ({ process }) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-50 bg-gradient-to-r from-blue-50/30 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <ClipboardCheck size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Process Rule</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-mono border border-slate-200">
                                {process.rule_id}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mt-0.5">流程规程判定</h3>
                    </div>
                </div>

                {process.category && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200/50">
                        <Layers size={14} className="text-slate-400" />
                        {process.category}
                    </div>
                )}
            </div>

            {/* Logic Flow Content */}
            <div className="p-8">
                <div className="relative space-y-8">
                    {/* Connector Line */}
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>

                    {/* Scenario Step */}
                    <div className="relative z-10 flex gap-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center text-blue-600 bg-white">
                            <PlayCircle size={18} />
                        </div>
                        <div className="flex-1 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1. Scenario (业务场景)</span>
                            <p className="text-slate-900 font-semibold mt-1 text-lg leading-relaxed">
                                {process.scenario}
                            </p>
                        </div>
                    </div>

                    {/* Condition Step */}
                    <div className="relative z-10 flex gap-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-500 flex items-center justify-center text-amber-500 bg-white">
                            <AlertCircle size={18} />
                        </div>
                        <div className="flex-1 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2. Condition (判定条件)</span>
                            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 mt-2">
                                <p className="text-slate-700 font-medium leading-relaxed">
                                    {process.condition}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Result Step */}
                    <div className="relative z-10 flex gap-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 bg-white">
                            <CheckCircle2 size={18} />
                        </div>
                        <div className="flex-1 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3. Result / Policy (处理结果)</span>
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 mt-2">
                                <p className="text-emerald-900 font-bold text-base leading-relaxed">
                                    {process.result}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessCard;
