import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { fetchOverviewStats, type DashboardOverviewResponse, type CategoryStat } from '../api/corpus';

const StatsOverview: React.FC = () => {
  const { t } = useLanguage();

  // 数据状态
  const [stats, setStats] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从 API 获取统计数据
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchOverviewStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch overview stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="w-full bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-28">

          <div className="space-y-10">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                {t('companyName')}
              </h1>
              <p className="text-xl font-bold text-primary-600 font-mono italic">
                {t('companySlogan')}
              </p>
              <div className="w-20 h-1.5 bg-gradient-to-r from-primary-600 to-blue-400 rounded-full"></div>
            </div>

            <p className="text-slate-600 text-lg leading-relaxed font-sans max-w-xl">
              {t('companyIntro')}
            </p>

            <div className="grid grid-cols-3 gap-6 pt-4">
              {loading ? (
                <div className="flex items-center py-4">
                  <Loader2 className="animate-spin text-primary-600 mr-2" size={20} />
                  <span className="text-slate-500 font-mono">Loading...</span>
                </div>
              ) : error ? (
                <div className="text-red-500 font-mono py-4">Error: {error}</div>
              ) : (
                <>
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="text-3xl font-bold text-primary-600 font-mono group-hover:scale-105 transition-transform origin-left">{stats?.corpus_count || 0}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mt-1">{t('corpora')}</div>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="text-3xl font-bold text-primary-600 font-mono group-hover:scale-105 transition-transform origin-left">{stats?.total_pairs?.toLocaleString() || 0}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mt-1">{t('totalPairs')}</div>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="text-3xl font-bold text-primary-600 font-mono group-hover:scale-105 transition-transform origin-left">{stats?.language_count || 0}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mt-1">{t('languagesAvailable')}</div>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 max-w-md">
              <p className="text-slate-500 font-mono text-sm leading-relaxed uppercase">
                {t('tableNote')}
              </p>
            </div>
          </div>

          {/* Right Column: Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              <div className="col-span-6">{t('corpus')}</div>
              <div className="col-span-3 text-right">{t('sentences')}</div>
              <div className="col-span-3 text-right">{t('percent')}</div>
            </div>

            {/* Table Body - Scrollable */}
            <div className="overflow-y-auto flex-grow custom-scrollbar">
              {!loading && !error && stats?.categories ? (
                stats.categories.map((item, index) => (
                  <div
                    key={item.name}
                    className={`grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-50 items-center hover:bg-primary-50 transition-colors group cursor-default ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  >
                    <div className="col-span-6 font-mono text-sm font-medium text-primary-600 group-hover:text-primary-700 flex items-center">
                      {item.name}
                      <ArrowUpRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="col-span-3 text-right font-mono text-sm text-slate-600">
                      {item.sentences}
                    </div>
                    <div className="col-span-3 text-right font-mono text-sm text-slate-600">
                      {item.percent}%
                    </div>
                  </div>
                ))
              ) : null}
            </div>

            {/* Tiny decoration at bottom of table */}
            <div className="h-1 bg-gradient-to-r from-primary-400 to-blue-200"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatsOverview;