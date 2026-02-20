import React, { useState, useEffect, useRef } from 'react';
import { fetchCorpusSamples, fetchCorpusDetail, fetchKWICAnalysis, type CorpusItem as CorpusDetailItem, type KWICSearchParams, type KWICResponse } from '../api/corpus';
import { ArrowLeft, Code, LayoutList, Clock, Hash, Smartphone, Tag, MessageCircle, AlertCircle, Globe, ChevronDown, Search, Filter, Sparkles, ArrowRight, FileText, Zap, BarChart3, Cloud, PieChart } from 'lucide-react';
import { useLanguage } from './LanguageContext';

// Tab 类型定义
export type TabType = 'detail' | 'kwic' | 'statistics';

interface SamplePreviewProps {
  corpusId: number | null;
  onBack: () => void;
  onError?: (error: string) => void;
}

// 语料库详情接口（从 API 导入 CorpusItem 但这里我们只需要名称）
interface CorpusInfo {
  id: number;
  name: string;
  description: string | null;
  source_lang: string;
  target_lang: string;
  domain: string;
}

// Interfaces based on the user's 4-layer structure
interface BasicLayer {
  sentence_id: string;
  timestamp: string;
  platform: string;
}

interface LanguageLayer {
  source_text_zh: string;
  raw_text_ms: string;
  normalized_text_ms: string;
  english_loanwords: string[];
}

interface PragmaticLayer {
  intent: string[];
  sentiment: 'neutral' | 'positive' | 'negative' | 'angry';
  business_scenario: 'pre-sales' | 'in-sales' | 'after-sales';
}

interface StyleLayer {
  style: string;
  contains_rojak: boolean;
  abbreviations_handled: Record<string, string>;
}

interface CorpusItem {
  basic_layer: BasicLayer;
  language_layer: LanguageLayer;
  pragmatic_layer: PragmaticLayer;
  style_layer: StyleLayer;
}

const SamplePreview: React.FC<SamplePreviewProps> = ({ corpusId, onBack, onError }) => {
  const { t } = useLanguage();
  const [showJson, setShowJson] = useState(false);
  const [samples, setSamples] = useState<CorpusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [corpusInfo, setCorpusInfo] = useState<CorpusInfo | null>(null);

  // 标签页导航状态
  const [activeTab, setActiveTab] = useState<TabType>('detail');

  // 当前选中的句子 ID（从 KWIC 语境点击时设置）
  const [selectedSentenceId, setSelectedSentenceId] = useState<string | null>(null);

  const [posChartAnimated, setPosChartAnimated] = useState(false);



  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // KWIC 分析状态
  const [kwicKeyword, setKwicKeyword] = useState('');
  const [kwicContextWindow, setKwicContextWindow] = useState<3 | 5 | 7>(5);
  const [kwicPage, setKwicPage] = useState(1);
  const kwicItemsPerPage = 50;

  // KWIC 结果状态
  const [kwicResults, setKwicResults] = useState<any[]>([]);
  const [kwicLoading, setKwicLoading] = useState(false);
  const [kwicTotal, setKwicTotal] = useState(0);

  // 词频统计状态
  const [freqData, setFreqData] = useState<{word: string; count: number; percent: number; pos?: string}[]>([]);
  const [freqLoading, setFreqLoading] = useState(false);
  const [freqTotalWords, setFreqTotalWords] = useState(0);
  const [freqUniqueWords, setFreqUniqueWords] = useState(0);
  const [freqFilter, setFreqFilter] = useState<'all' | 'noun' | 'verb' | 'adj'>('all');
  const [freqSort, setFreqSort] = useState<'freq' | 'alpha'>('freq');
  const [freqSearchKeyword, setFreqSearchKeyword] = useState('');
  const [freqFilterStopWords, setFreqFilterStopWords] = useState(true);
  const [posDistribution, setPosDistribution] = useState<{noun: number; verb: number; adj: number; other: number}>({noun: 0, verb: 0, adj: 0, other: 0});
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  // 当切换到统计 Tab 且数据加载完成时，触发动画
  useEffect(() => {
    if (activeTab === 'statistics' && !freqLoading) {
      // 重置动画状态以支持重新播放（可选）
      setPosChartAnimated(false);
      const timer = setTimeout(() => setPosChartAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, freqLoading]);

  // 当切换到 detail 标签且有选中的句子时，滚动到对应的卡片
  const selectedCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'detail' && selectedSentenceId && selectedCardRef.current) {
      setTimeout(() => {
        selectedCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [activeTab, selectedSentenceId]);


  // 停用词列表（马来语停用词）
  const stopWords = new Set([
    'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'itu', 'bagi', 'ada', 'dengan',
    'pada', 'bagaimana', 'juga', 'le', 'lah', 'tah', 'nah', 'kah', 'jangan',
    'saya', 'kamu', 'kami', 'mereka', 'tersebut', 'tetapi', 'kalau', 'hingga'
  ]);

  // 词云图布局算法 - 螺旋布局
  const calculateWordCloudLayout = (words: {word: string; count: number}[]) => {
    const layout = [];
    const centerX = 150; // 容器中心 X
    const centerY = 150; // 容器中心 Y
    const maxRadius = 140; // 最大半径

    // 按频次排序（高到低）
    const sortedWords = [...words].sort((a, b) => b.count - a.count);

    // 螺旋布局算法
    let angle = 0;
    let radius = 0;
    const radiusStep = 15; // 每圈增加的半径
    const angleStep = (2 * Math.PI) / 6; // 每个词增加的角度（黄金分割）

    sortedWords.forEach((item, index) => {
      const fontSize = Math.max(14, Math.min(48, 14 + Math.log2(item.count + 1) * 6));
      const fontWeight = index < 5 ? '800' : index < 15 ? '700' : index < 30 ? '600' : '400';

      // 计算位置（螺旋扩散）
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      layout.push({
        ...item,
        x,
        y,
        fontSize,
        fontWeight,
        opacity: Math.max(0.4, 1 - (index * 0.015)), // 渐变透明度
        color: index < 5 ? 'text-blue-700' :
                index < 15 ? 'text-emerald-600' :
                index < 30 ? 'text-amber-600' :
                'text-slate-500'
      });

      // 更新角度和半径（螺旋向外）
      angle += angleStep;
      if (angle >= 2 * Math.PI) {
        angle -= 2 * Math.PI;
        radius += radiusStep;
      }

      if (radius > maxRadius) {
        radius = maxRadius;
      }
    });

    return layout;
  };

  // KWIC 搜索函数
  const handleKWICSearch = async () => {
    if (!kwicKeyword.trim()) return;
    setKwicPage(1);
    setKwicLoading(true);
    try {
      const response = await fetchKWICAnalysis(corpusId!, {
        keyword: kwicKeyword,
        context_window: kwicContextWindow,
        page: kwicPage,
        limit: kwicItemsPerPage
      });
      setKwicResults(response.items);
      setKwicTotal(response.total);
    } catch (error) {
      console.error('KWIC search failed:', error);
    } finally {
      setKwicLoading(false);
    }
  };

  // KWIC 结果分页
  const [kwicCurrentPage, setKwicCurrentPage] = useState(1);
  const kwicTotalPages = Math.ceil((kwicTotal || 0) / kwicItemsPerPage);

  const handleKwicPageChange = (page: number) => {
    setKwicPage(page);
    setKwicCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 获取语料库信息
  useEffect(() => {
    const loadCorpusInfo = async () => {
      if (!corpusId) return;
      try {
        const info = await fetchCorpusDetail(corpusId);
        setCorpusInfo(info);
        setHasPermission(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '加载语料库信息失败';
        if (errorMessage.includes('403') || errorMessage.includes('无权访问')) {
          setHasPermission(false);
          if (onError) {
            onError('无权访问此语料库');
          }
        } else {
          setError(errorMessage);
        }
        console.error('Failed to load corpus info:', err);
      }
    };
    loadCorpusInfo();
  }, [corpusId]);

  // 当语料库信息加载完成后，更新搜索框状态
  useEffect(() => {
    if (corpusInfo) {
      setSource(corpusInfo.source_lang);
      setTarget(corpusInfo.target_lang);
      setDomain(corpusInfo.domain === 'ecommerce' ? 'ecommerce' : 'general');
    }
  }, [corpusInfo]);

  useEffect(() => {
    const loadSamples = async () => {
      if (!corpusId) return;
      if (hasPermission === false) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetchCorpusSamples(corpusId, { page: 1, limit: 10 });
        setSamples(response.items as unknown as CorpusItem[]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '加载样本失败';
        if (errorMessage.includes('403') || errorMessage.includes('无权访问')) {
          setHasPermission(false);
          if (onError) {
            onError('无权访问此语料库');
          }
        } else {
          setError(errorMessage);
        }
        console.error('Failed to load samples:', err);
      } finally {
        setLoading(false);
      }
    };

    if (hasPermission !== false) {
      loadSamples();
    }
  }, [corpusId, hasPermission]);

  // KWIC 数据加载
  useEffect(() => {
    const loadKWICData = async () => {
      if (!corpusId || !kwicKeyword || activeTab !== 'kwic') return;
      setKwicLoading(true);
      try {
        const response = await fetchKWICAnalysis(corpusId, {
          keyword: kwicKeyword,
          context_window: kwicContextWindow,
          page: kwicPage,
          limit: kwicItemsPerPage
        });
        setKwicResults(response.items);
        setKwicTotal(response.total);
      } catch (error) {
        console.error('Failed to load KWIC data:', error);
      } finally {
        setKwicLoading(false);
      }
    };
    loadKWICData();
  }, [corpusId, kwicKeyword, kwicContextWindow, kwicPage, activeTab]);

  // 词频统计数据加载
  useEffect(() => {
    const loadFrequencyData = async () => {
      if (!corpusId || activeTab !== 'statistics') return;
      setFreqLoading(true);
      try {
        // 从样本数据中计算词频
        if (samples.length > 0) {
          const wordMap = new Map<string, {count: number; pos: string}>();
          let totalCount = 0;
          const posCounts = { noun: 0, verb: 0, adj: 0, other: 0 };

          samples.forEach(sample => {
            const text = sample.language_layer.normalized_text_ms || sample.language_layer.raw_text_ms || '';
            const words = text.toLowerCase().split(/\s+/);
            words.forEach(word => {
              if (word.length > 1) {  // 忽略单字符
                // 过滤停用词
                if (freqFilterStopWords && stopWords.has(word)) return;

                const current = wordMap.get(word) || { count: 0, pos: 'other' };
                wordMap.set(word, { count: current.count + 1, pos: current.pos });
                totalCount++;
              }
            });
          });

          // 简化的词性判断（基于后缀）
          Array.from(wordMap.entries()).forEach(([word, data]) => {
            if (word.endsWith('nya') || word.endsWith('an')) {
              data.pos = 'adj';
              posCounts.adj += data.count;
            } else if (word.endsWith('kan') || word.endsWith('i')) {
              data.pos = 'verb';
              posCounts.verb += data.count;
            } else if (word.endsWith('nya')) {
              data.pos = 'noun';
              posCounts.noun += data.count;
            } else {
              posCounts.other += data.count;
            }
          });

          // 转换为数组并排序
          let freqArray = Array.from(wordMap.entries())
            .filter(([_, data]) => {
              // 词性筛选
              if (freqFilter === 'all') return true;
              return data.pos === freqFilter;
            })
            .filter(([word]) => {
              // 搜索过滤
              if (freqSearchKeyword && !word.toLowerCase().includes(freqSearchKeyword.toLowerCase())) return false;
              return true;
            })
            .map(([word, data]) => ({
              word,
              count: data.count,
              percent: Math.round((data.count / totalCount) * 1000) / 10,
              pos: data.pos
            }))
            .sort((a, b) => freqSort === 'freq' ? b.count - a.count : a.word.localeCompare(b.word));

          setFreqData(freqArray.slice(0, 100));  // 限制前 100 个
          setFreqTotalWords(totalCount);
          setFreqUniqueWords(wordMap.size);
          setPosDistribution(posCounts);
        }
      } catch (error) {
        console.error('Failed to load frequency data:', error);
      } finally {
        setFreqLoading(false);
      }
    };
    loadFrequencyData();
  }, [corpusId, activeTab, samples, freqSort, freqFilter, freqSearchKeyword, freqFilterStopWords]);

  // 点击词频词汇跳转到 KWIC 搜索
  const handleWordClick = (word: string) => {
    setKwicKeyword(word);
    setActiveTab('kwic');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mock state for the persistent search bar
  const [source, setSource] = useState(corpusInfo?.source_lang || 'en');
  const [target, setTarget] = useState(corpusInfo?.target_lang || 'ms');
  const [domain, setDomain] = useState(corpusInfo?.domain === 'ecommerce' ? 'ecommerce' : 'general');
  const [keyword, setKeyword] = useState('');

  // 当关键词变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  const languages = [
    { code: 'zh', label: t('langChinese') },
    { code: 'en', label: t('langEnglish') },
    { code: 'th', label: t('langThai') },
    { code: 'vi', label: t('langVietnamese') },
    { code: 'ms', label: t('langMalay') },
  ];

  // Filtering Logic
  const filteredData = samples.filter(item => {
    const q = keyword.toLowerCase();
    if (!q) return true;
    return (
      item.language_layer.source_text_zh.toLowerCase().includes(q) ||
      item.language_layer.raw_text_ms.toLowerCase().includes(q) ||
      item.language_layer.normalized_text_ms.toLowerCase().includes(q) ||
      item.basic_layer.sentence_id.toLowerCase().includes(q)
    );
  });

  // 排序逻辑：如果有选中的句子，将其移到第一个位置
  let data = filteredData;
  if (selectedSentenceId) {
    const selectedIndex = data.findIndex(item => item.basic_layer.sentence_id === selectedSentenceId);
    if (selectedIndex > 0) {
      const selectedItem = data[selectedIndex];
      data = [selectedItem, ...data.slice(0, selectedIndex), ...data.slice(selectedIndex + 1)];
    }
  }

  // 分页逻辑
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  // 翻页处理函数
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination Component
  const Pagination = () => {
    if (paginatedData.length === 0 || totalPages <= 1) return null;

    // Helper function for button className
    const getButtonClass = (isActive: boolean, isDisabled: boolean) => {
      if (isDisabled) return 'px-4 py-2 text-sm font-medium border rounded-lg transition-colors bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed';
      if (isActive) return 'px-4 py-2 text-sm font-medium border rounded-lg transition-colors bg-primary-600 text-white border-primary-600';
      return 'px-4 py-2 text-sm font-medium border rounded-lg transition-colors bg-white text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer';
    };

    // Helper to determine page numbers to show
    const getPageNumbers = () => {
      const pages: number[] = [];
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
      }
      return pages;
    };

    return (
      <div className="flex justify-center pt-6">
        <div className="inline-flex rounded-md shadow-sm">
          {/* Previous Button */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={getButtonClass(false, currentPage === 1)}
          >
            {t('paginationPrevious')}
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageClick(pageNum)}
              className={getButtonClass(pageNum === currentPage, false)}
            >
              {pageNum}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={getButtonClass(false, currentPage === totalPages)}
          >
            {t('paginationNext')}
          </button>
        </div>
      </div>
    );
  };

  // Helper to get sentiment color
  const getSentimentStyle = (sentiment: string) => {
    switch(sentiment) {
      case 'angry': return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100';
      case 'positive': return 'bg-green-50 text-green-700 border-green-200 ring-1 ring-green-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 ring-1 ring-slate-100';
    }
  };

  // Helper for scenario badge (using translated labels)
  const getScenarioBadge = (scenario: string) => {
    switch(scenario) {
      case 'pre-sales': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">Pre-sales / {t('tabPresales')}</span>;
      case 'in-sales': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">In-sales / {t('tabInsales')}</span>;
      case 'after-sales': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">After-sales / {t('tabAftersales')}</span>;
      default: return null;
    }
  };

  const getSentimentLabel = (s: string) => {
      switch(s) {
          case 'neutral': return t('labelNeutral');
          case 'positive': return t('labelPositive');
          case 'negative': return t('labelNegative');
          case 'angry': return t('labelAngry');
          default: return s;
      }
  };

  if (loading) {
    return (
      <div className="w-full bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-slate-400">加载中...</div>
      </div>
    );
  }

  if (hasPermission === false) {
    if (onError) {
      onError('无权访问此语料库');
    }
    return (
      <div className="w-full bg-slate-50 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-slate-400">返回中...</div>
      </div>
    );
  }

  if (!corpusId) {
    return (
      <div className="w-full bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-slate-400">请先选择一个语料库</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20">
      
      {/* 1. Persistent Search Bar Section */}
      <div className="w-full bg-white border-b border-slate-100 py-6 px-6 md:px-12 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-3xl">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Select Source Language */}
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 group-hover:text-primary-600">
                    <ChevronDown size={16} />
                </div>
                <select 
                    className="block w-full pl-4 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg bg-slate-50 hover:bg-white border transition-all appearance-none text-slate-700 font-mono shadow-sm"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                >
                  <option value="" disabled>{t('selectSource')}</option>
                  {languages.map(lang => (
                    <option key={`source-${lang.code}`} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>

              {/* Select Target Language */}
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 group-hover:text-primary-600">
                    <ChevronDown size={16} />
                </div>
                 <select 
                    className="block w-full pl-4 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg bg-slate-50 hover:bg-white border transition-all appearance-none text-slate-700 font-mono shadow-sm cursor-pointer"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="" disabled>{t('selectTarget')}</option>
                  {languages.map(lang => (
                    <option key={`target-${lang.code}`} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>

               {/* Keyword Search Input */}
               <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Search size={16} />
                    </div>
                    <input 
                        type="text" 
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder={t('labelKeyword')}
                        className="block w-full pl-10 pr-4 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg bg-slate-50 hover:bg-white border transition-all text-slate-700 font-mono shadow-sm"
                    />
               </div>

              {/* Search Button */}
              <button 
                  className="p-2.5 border rounded-lg shadow-sm transition-all flex items-center justify-center min-w-[3rem] bg-primary-600 border-primary-600 text-white hover:bg-primary-700 hover:shadow-md cursor-pointer"
              >
                <Search size={18} />
              </button>
            </div>

            {/* Domain Selector Row */}
            <div className="mt-3">
                 <div className="relative group w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <Filter size={16} />
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 group-hover:text-primary-600">
                        <ChevronDown size={16} />
                    </div>
                    <select
                        className="block w-full pl-10 pr-10 py-2.5 text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-lg bg-slate-50 hover:bg-white border transition-all appearance-none text-slate-700 font-mono shadow-sm"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                    >
                        <option value="">{t('domainAll')}</option>
                        <option value="ecommerce">{t('domainEcommerce')}</option>
                        <option value="tourism">{t('domainTourism')}</option>
                        <option value="business">{t('domainBusiness')}</option>
                        <option value="economy">{t('domainEconomy')}</option>
                        <option value="general">{t('domainGeneral')}</option>
                    </select>
                 </div>
            </div>
        </div>
      </div>
      
      {/* 2. Corpus Header */}
      <div className="w-full bg-white border-b border-slate-200 shadow-sm z-20">
        <div className="w-full px-6 md:px-12 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors flex items-center group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 font-mono flex items-center">
                  {corpusInfo?.name || 'Loading...'}
                  <span className="ml-3 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 border border-slate-200 font-normal uppercase tracking-wider">{t('samplePreview')}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">语料样本预览</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="text-xs text-slate-400 font-mono hidden sm:block">
                {t('lblDisplaying').replace('{current}', filteredData.length.toString()).replace('{total}', '3,150,000')}
             </div>
             <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
                <button 
                    onClick={() => setShowJson(false)}
                    className={`p-1.5 rounded-md transition-all flex items-center space-x-2 ${!showJson ? 'bg-white shadow-sm text-primary-600 font-medium' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <LayoutList size={16} />
                    <span className="text-xs hidden md:inline">{t('lblVisual')}</span>
                </button>
                <button 
                    onClick={() => setShowJson(true)}
                    className={`p-1.5 rounded-md transition-all flex items-center space-x-2 ${showJson ? 'bg-white shadow-sm text-primary-600 font-medium' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Code size={16} />
                     <span className="text-xs hidden md:inline">{t('lblJsonl')}</span>
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content */}
      <div className="w-full px-6 md:px-12 py-6 space-y-6">

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200" role="tablist" aria-label="Sample preview tabs">
            <div className="flex">
              {/* Tab 1: 样本详情 */}
              <button
                onClick={() => setActiveTab('detail')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer ${
                  activeTab === 'detail'
                    ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                role="tab"
                aria-selected={activeTab === 'detail'}
                tabIndex={activeTab === 'detail' ? 0 : -1}
              >
                <FileText size={18} />
                <span className="hidden sm:inline">{t('tabDetail')}</span>
              </button>

              {/* Tab 2: KWIC 分析 */}
              <button
                onClick={() => setActiveTab('kwic')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer ${
                  activeTab === 'kwic'
                    ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                role="tab"
                aria-selected={activeTab === 'kwic'}
                tabIndex={activeTab === 'kwic' ? 0 : -1}
              >
                <Search size={18} />
                <span className="hidden sm:inline">{t('tabKwic')}</span>
              </button>

              {/* Tab 3: 词频统计 */}
              <button
                onClick={() => setActiveTab('statistics')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer ${
                  activeTab === 'statistics'
                    ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                role="tab"
                aria-selected={activeTab === 'statistics'}
                tabIndex={activeTab === 'statistics' ? 0 : -1}
              >
                <BarChart3 size={18} />
                <span className="hidden sm:inline">{t('tabStatistics')}</span>
              </button>
            </div>
          </div>

          {/* Tab Panels */}
          <div className="p-6">
            {activeTab === 'detail' && (
              <div role="tabpanel" aria-labelledby="tab-detail" className="space-y-6">
                 {paginatedData.map((item, index) => (
                  <div key={item.basic_layer.sentence_id} className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 ${selectedSentenceId === item.basic_layer.sentence_id ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}>

            
            {/* Card Header: Metadata Row */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
               <div className="flex items-center space-x-6 text-xs text-slate-500 font-mono">
                  <div className="flex items-center bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
                     <span className="font-bold text-slate-700 mr-2">UUID:</span>
                     {item.basic_layer.sentence_id}
                  </div>
                  <div className="flex items-center hidden sm:flex">
                    <Clock size={12} className="mr-1.5 text-slate-400" />
                    {new Date(item.basic_layer.timestamp).toLocaleString()}
                  </div>
                  <div className="flex items-center hidden sm:flex">
                    <Smartphone size={12} className="mr-1.5 text-slate-400" />
                    {item.basic_layer.platform}
                  </div>
               </div>
               
               <div>
                  {getScenarioBadge(item.pragmatic_layer.business_scenario)}
               </div>
            </div>

            {showJson ? (
                // JSON VIEW
                <div className="p-0 bg-slate-900 overflow-x-auto">
                    <pre className="p-6 text-xs md:text-sm font-mono text-green-400 leading-relaxed">
                        {JSON.stringify(item, null, 2)}
                    </pre>
                </div>
            ) : (
                // VISUAL VIEW
                <div className="flex flex-col lg:flex-row">
                    
                    {/* Main Content: Language & Linguistics (Expanded Left Side) */}
                    <div className="flex-grow p-6 space-y-8 lg:border-r border-slate-100">
                        
                        {/* 1. Translation Pair */}
                        <div className="space-y-6">
                            {/* Source */}
                            <div>
                                <div className="flex items-center mb-2">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mr-2">ZH-CN</span>
                                    <span className="text-xs font-medium text-slate-500">{t('lblSourceText')}</span>
                                </div>
                                <p className="text-xl text-slate-800 font-medium leading-relaxed p-4 rounded-lg bg-white border border-transparent hover:border-slate-100 transition-colors">
                                    {item.language_layer.source_text_zh}
                                </p>
                            </div>

                            {/* Divider with Label */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-slate-100"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-[10px] text-slate-300 font-mono uppercase tracking-widest">Translation & Normalization</span>
                                </div>
                            </div>

                            {/* Target Comparison Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Raw */}
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center mb-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded mr-2">MS-RAW</span>
                                        <span className="text-xs font-medium text-slate-500">{t('lblRawInput')}</span>
                                    </div>
                                    <div className="flex-grow p-4 rounded-lg bg-slate-50 border border-slate-200 font-mono text-sm text-slate-600 leading-relaxed">
                                        {item.language_layer.raw_text_ms}
                                    </div>
                                </div>

                                {/* Normalized */}
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center mb-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary-100 bg-primary-600 text-white px-1.5 py-0.5 rounded mr-2">MS-NORM</span>
                                        <span className="text-xs font-medium text-primary-600">{t('lblNormalized')}</span>
                                    </div>
                                    <div className="flex-grow p-4 rounded-lg bg-green-50/30 border border-green-100 text-base text-slate-800 leading-relaxed">
                                        {item.language_layer.normalized_text_ms}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Linguistic Insights (Moved to Bottom to fill space) */}
                        <div className="pt-2">
                             <div className="flex items-center space-x-3 mb-5">
                                <div className="h-px bg-slate-100 flex-grow"></div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                    <Sparkles size={12} className="mr-1.5 text-amber-500" />
                                    {t('lblLinguistic')}
                                </span>
                                <div className="h-px bg-slate-100 flex-grow"></div>
                             </div>
                             
                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Normalization Map Box */}
                                {Object.keys(item.style_layer.abbreviations_handled).length > 0 ? (
                                     <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100">
                                        <div className="text-[11px] font-bold text-slate-400 mb-3 flex items-center uppercase tracking-wider">
                                            <FileText size={12} className="mr-1.5"/> {t('lblNormMap')}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                             {Object.entries(item.style_layer.abbreviations_handled).map(([short, full]) => (
                                                <div key={short} className="flex items-center bg-white border border-slate-200 rounded-md px-2.5 py-1.5 shadow-sm hover:shadow-md transition-shadow cursor-default">
                                                    <span className="text-red-500 font-mono text-xs font-medium">{short}</span>
                                                    <ArrowRight size={10} className="mx-2 text-slate-300" />
                                                    <span className="text-green-600 font-mono text-xs font-bold">{full}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 flex items-center justify-center text-slate-400 text-xs italic">
                                        {t('lblNoNormNeeded')}
                                    </div>
                                )}

                                 {/* Loanwords & Style Box */}
                                 <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 flex flex-col justify-between">
                                    
                                    {/* Loanwords */}
                                    <div className="mb-4">
                                        <div className="text-[11px] font-bold text-slate-400 mb-3 flex items-center uppercase tracking-wider">
                                            <Globe size={12} className="mr-1.5"/> {t('lblLoanwords')}
                                        </div>
                                        {item.language_layer.english_loanwords.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {item.language_layer.english_loanwords.map(w => (
                                                    <span key={w} className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-md text-xs font-mono font-medium">
                                                        {w}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">{t('lblNoneDetected')}</span>
                                        )}
                                    </div>

                                    {/* Small Style Indicators */}
                                    <div className="pt-4 border-t border-slate-200">
                                         <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">{t('lblStyle')}</span>
                                                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-medium">
                                                    {item.style_layer.style}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">{t('lblRojak')}</span>
                                                <span className={`font-mono font-bold ${item.style_layer.contains_rojak ? 'text-blue-600' : 'text-slate-300'}`}>
                                                    {item.style_layer.contains_rojak ? t('lblDetected') : t('lblNone')}
                                                </span>
                                            </div>
                                         </div>
                                    </div>
                                </div>
                             </div>
                        </div>

                    </div>

                    {/* Right Sidebar: High Level Analysis (Narrower, cleaner) */}
                    <div className="w-full lg:w-72 bg-slate-50/30 p-6 flex-shrink-0 flex flex-col space-y-8">
                        
                        {/* Pragmatic Analysis */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center border-b border-slate-200 pb-2">
                                <MessageCircle size={12} className="mr-2" /> {t('lblPragmatic')}
                            </h4>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">{t('lblUserIntent')}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {item.pragmatic_layer.intent.map(i => (
                                            <span key={i} className="px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-700 shadow-sm font-medium w-full text-center">
                                                {i}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">{t('lblSentiment')}</div>
                                    <div className={`flex items-center justify-center px-4 py-3 rounded-lg border ${getSentimentStyle(item.pragmatic_layer.sentiment)}`}>
                                        {item.pragmatic_layer.sentiment === 'angry' && <AlertCircle size={16} className="mr-2" />}
                                        <span className="text-sm font-bold uppercase tracking-wide">{getSentimentLabel(item.pragmatic_layer.sentiment)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extra Meta (Optional place for more tags) */}
                        <div className="flex-grow"></div>
                        
                        <div className="text-[10px] text-slate-300 font-mono text-center">
                            Analysis v3.0.1
                        </div>

                    </div>
                </div>
            )}
          </div>
        ))}

        {/* Pagination */}
        <Pagination />
        </div>
        )}

        {/* End Detail Tab Panel */}

            {activeTab === 'kwic' && (
              <div role="tabpanel" aria-labelledby="tab-kwic" className="space-y-6">
                {/* KWIC 搜索界面 */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <Search size={20} className="mr-2 text-primary-600" />
                    {t('kwicTitle')}
                  </h3>

                  {/* 搜索表单 */}
                  <div className="space-y-4">
                    {/* 关键词输入 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t('kwicKeyword')}
                      </label>
                      <input
                        type="text"
                        value={kwicKeyword}
                        onChange={(e) => setKwicKeyword(e.target.value)}
                        placeholder={t('kwicKeywordPlaceholder')}
                        className="w-full px-4 py-2.5 text-sm border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 hover:bg-white border transition-all text-slate-700 font-mono"
                      />
                    </div>

                    {/* 语境窗口选择和搜索按钮 */}
                    <div className="flex flex-wrap gap-4 items-end">
                      {/* 语境窗口选择器 */}
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t('kwicContextWindow')}
                        </label>
                        <select
                          value={kwicContextWindow}
                          onChange={(e) => setKwicContextWindow(Number(e.target.value) as 3 | 5 | 7)}
                          className="w-full px-4 py-2.5 text-sm border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 hover:bg-white border transition-all text-slate-700 font-mono"
                        >
                          <option value={3}>{t('kwicContext3')}</option>
                          <option value={5}>{t('kwicContext5')}</option>
                          <option value={7}>{t('kwicContext7')}</option>
                        </select>
                      </div>

                      {/* 搜索按钮 */}
                      <button
                        onClick={handleKWICSearch}
                        disabled={kwicLoading || !kwicKeyword.trim()}
                        className="py-3 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <Search size={18} className={kwicLoading ? 'animate-spin' : ''} />
                        {t('kwicSearch')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* KWIC 结果显示 */}
{(kwicLoading || kwicResults.length > 0) && (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
        <h4 className="text-sm font-bold text-slate-800">
          {t('kwicResultCount').replace('{count}', String(kwicResults.length))}
        </h4>
      </div>

      {/* KWIC 结果表格 */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/50">
              {/* 左语境：右对齐 */}
              <th className="px-4 py-3 text-right font-semibold w-[45%]">
                {t('kwicLeftContext')}
              </th>
              {/* 关键词：居中 */}
              <th className="px-2 py-3 text-center font-bold text-primary-600 w-[10%]">
                {t('kwicKeyword')}
              </th>
              {/* 右语境：左对齐 */}
              <th className="px-4 py-3 text-left font-semibold w-[45%]">
                {t('kwicRightContext')}
              </th>
                </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {kwicResults.map((result) => (
              <tr
                key={result.sentence_id}
                className="hover:bg-primary-50/50 transition-colors cursor-pointer group"
                onClick={() => {
                  setSelectedSentenceId(result.sentence_id);
                  setActiveTab('detail');
                }}
              >
                {/* 左语境：文字向右靠拢 */}
                <td className="px-4 py-3 text-right text-slate-500 font-mono text-sm truncate">
                  {result.left_context}
                </td>
                {/* 关键词：中间对齐，突出显示 */}
                <td className="px-2 py-3 text-center">
                  <span className="inline-block bg-primary-100 text-primary-700 px-2 py-0.5 rounded font-bold text-sm">
                    {result.keyword}
                  </span>
                </td>
                {/* 右语境：文字向左靠拢 */}
                <td className="px-4 py-3 text-left text-slate-500 font-mono text-sm truncate">
                  {result.right_context}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {kwicLoading && (
        <div className="text-center py-12 text-slate-400">
          <div className="animate-spin mb-3 inline-block">
            <Search size={24} className="text-primary-600" />
          </div>
          <p className="text-sm">正在检索语料库...</p>
        </div>
      )}
    </div>
  </div>
)}

                {/* KWIC 无结果提示 */}
                {!kwicLoading && kwicResults.length === 0 && kwicKeyword && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                    <Search size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium text-slate-600">
                      {t('kwicNoResults')}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      {t('kwicResultCount').replace('{count}', '0')}
                    </p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'statistics' && (
              <div role="tabpanel" aria-labelledby="tab-statistics" className="space-y-4">
                {/* 可视化图表区 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 左侧：词性分布 - 完全重构版 (Modern Data Card) */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-8 h-full flex flex-col justify-between">
                  
                  {/* 1. 标题栏 - 极简风格 */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <PieChart size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{t('freqPosDistribution')}</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Distribution Analysis</p>
                      </div>
                    </div>
                    {/* 右上角显示总数小标签 */}
                    <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-mono text-slate-500">
                      Total: {freqTotalWords || 0}
                    </div>
                  </div>

                  {freqLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[240px]">
                      <div className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                      <p className="text-xs text-slate-400 font-medium animate-pulse">{t('freqLoading')}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 flex-1">
                      
                      {/* 左侧：语料核心指标区域 */}
                      <div className="flex-1 w-full flex flex-col justify-center">
                        <div className="grid grid-cols-2 gap-4">
                          {/* 指标卡 1: 总词数 */}
                          <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Total Tokens</div>
                            <div className="flex items-end gap-2">
                              <span className="text-3xl font-black text-slate-800">{freqTotalWords}</span>
                              <span className="text-xs text-slate-400 mb-1.5 font-medium">词</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                              <div className="h-full bg-blue-500 w-full opacity-60"></div>
                            </div>
                          </div>

                          {/* 指标卡 2: 词汇丰富度 (TTR) */}
                          {(() => {
                            const ttr = ((freqUniqueWords / (freqTotalWords || 1)) * 100).toFixed(1);
                            return (
                              <div className="bg-indigo-50/30 border border-indigo-100/50 p-5 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                                <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-1">Lexical Richness</div>
                                <div className="flex items-end gap-2">
                                  <span className="text-3xl font-black text-indigo-600">{ttr}%</span>
                                </div>
                                <div className="text-[10px] text-indigo-300 mt-2 font-medium">TTR (词表比) 指标</div>
                              </div>
                            );
                          })()}

                          {/* 指标卡 3: 去重词数 */}
                          <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Unique Types</div>
                            <div className="flex items-end gap-2">
                              <span className="text-3xl font-black text-slate-700">{freqUniqueWords}</span>
                              <span className="text-xs text-slate-400 mb-1.5 font-medium">项</span>
                            </div>
                          </div>

                          {/* 指标卡 4: 平均句长 */}
                          <div className="bg-amber-50/30 border border-amber-100/50 p-5 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                            <div className="text-[10px] uppercase tracking-wider text-amber-500/70 font-bold mb-1">Avg. Sentence Length</div>
                            <div className="flex items-end gap-2">
                              <span className="text-3xl font-black text-amber-600">9.3</span>
                              <span className="text-xs text-amber-400 mb-1.5 font-medium">词/句</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                  {/* 词云图 - 螺旋布局 */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {(() => {
                    // --- 1. 配置区域：在这里调整艺术风格 ---
                    const containerWidth = 400; // 容器估算宽度
                    const containerHeight = 320; // 容器估算高度
                    const maxFontSize = 48; // 最大字号 (高频词)
                    const minFontSize = 12; // 最小字号 (背景词)
                    
                    // 高级配色方案：深蓝 -> 蓝紫 -> 浅灰 (品牌渐变感)
                    const colorPalette = [
                      'text-slate-900', // Top 1-3: 极致深色，强调核心
                      'text-primary-600', // Top 4-8: 品牌主色
                      'text-indigo-500', // Top 9-15: 辅助色
                      'text-slate-400', // Top 16-30: 中性灰
                      'text-slate-300', // Tail: 背景纹理
                    ];

                    // --- 2. 核心算法：中心螺旋布局 ---
                    const placedItems: any[] = [];
                    // 预处理数据：按频率降序，并计算样式
                    const dataToProcess = freqData.slice(0, 40).map((item, index) => {
                      // 对数缩放尺寸：让头尾差异更平滑但明显
                      const count = item.count;
                      const maxCount = freqData[0]?.count || 1;
                      const minCount = freqData[freqData.length - 1]?.count || 1;
                      const normalize = (count - minCount) / (maxCount - minCount || 1);
                      // Logarithmic scale approach
                      const fontSize = minFontSize + (maxFontSize - minFontSize) * Math.pow(normalize, 0.8);
                      
                      // 字重映射
                      let fontWeight = '400';
                      if (index < 3) fontWeight = '900'; // Black
                      else if (index < 10) fontWeight = '700'; // Bold
                      else if (index < 20) fontWeight = '500'; // Medium

                      // 颜色映射
                      let colorClass = colorPalette[4];
                      if (index < 3) colorClass = colorPalette[0];
                      else if (index < 8) colorClass = colorPalette[1];
                      else if (index < 15) colorClass = colorPalette[2];
                      else if (index < 30) colorClass = colorPalette[3];

                      return { ...item, fontSize, fontWeight, colorClass, x: 0, y: 0, width: 0, height: 0 };
                    });

                    // 简单的碰撞检测器
                    const isIntersecting = (rect1: any, rect2: any) => {
                      return !(
                        rect1.right < rect2.left ||
                        rect1.left > rect2.right ||
                        rect1.bottom < rect2.top ||
                        rect1.top > rect2.bottom
                      );
                    };

                    // 螺旋放置逻辑
                    dataToProcess.forEach((item, i) => {
                      // 估算文字宽高 (近似值，用于碰撞检测)
                      // 汉字宽高比约 1:1，英文约 0.6:1，这里做一个简单的估算
                      const charWidth = item.fontSize * (item.word.match(/[\u4e00-\u9fa5]/) ? 1 : 0.6);
                      const width = item.word.length * charWidth + 10; // +10 padding
                      const height = item.fontSize * 1.2;

                      let angle = 0;
                      let radius = 0;
                      let spiralStep = 0.5; // 螺旋步进
                      let angleStep = 0.2; // 角度步进
                      let x = 0;
                      let y = 0;
                      let collision = true;
                      let attempt = 0;

                      // 第一个词直接放中间
                      if (i === 0) {
                        x = 0; 
                        y = 0;
                        collision = false;
                      }

                      while (collision && attempt < 500) {
                        // 阿基米德螺旋公式
                        x = radius * Math.cos(angle);
                        y = radius * Math.sin(angle);

                        const currentRect = {
                          left: x - width / 2,
                          right: x + width / 2,
                          top: y - height / 2,
                          bottom: y + height / 2
                        };

                        // 检查是否与已放置的词碰撞
                        let hasOverlap = false;
                        for (const placed of placedItems) {
                          if (isIntersecting(currentRect, placed.rect)) {
                            hasOverlap = true;
                            break;
                          }
                        }

                        if (!hasOverlap) {
                          collision = false;
                        } else {
                          angle += angleStep;
                          radius += spiralStep;
                          attempt++;
                        }
                      }

                      placedItems.push({
                        ...item,
                        x,
                        y,
                        rect: {
                          left: x - width / 2,
                          right: x + width / 2,
                          top: y - height / 2,
                          bottom: y + height / 2
                        }
                      });
                    });

                    // --- 3. 渲染部分 ---
                    return placedItems.map((item) => {
                      const isHovered = hoveredWord === item.word;
                      // 动态计算 z-index 和透明度，保持 hover 时的聚焦感
                      const zIndex = isHovered ? 50 : (50 - Math.round(item.fontSize)); 
                      
                      return (
                        <div
                          key={item.word}
                          className="absolute flex items-center justify-center cursor-pointer select-none"
                          style={{
                            left: '50%', // 基准点在容器中心
                            top: '50%',
                            transform: `translate(calc(-50% + ${item.x}px), calc(-50% + ${item.y}px)) scale(${isHovered ? 1.2 : 1})`,
                            zIndex: zIndex,
                            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease', // 弹性动画
                            opacity: isHovered ? 1 : (hoveredWord ? 0.3 : 1), // 这里实现聚焦效果：hover时其他人变淡
                          }}
                          onClick={() => handleWordClick(item.word)}
                          onMouseEnter={() => setHoveredWord(item.word)}
                          onMouseLeave={() => setHoveredWord(null)}
                        >
                          <span
                            className={`${item.colorClass}`}
                            style={{
                              fontSize: `${item.fontSize}px`,
                              fontWeight: item.fontWeight,
                              lineHeight: 1,
                              whiteSpace: 'nowrap',
                              // 高级感光影：给大词加一点点文字阴影
                              textShadow: item.fontSize > 24 ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
                              filter: isHovered ? 'brightness(1.1)' : 'none'
                            }}
                          >
                            {item.word}
                          </span>

                          {/* 悬浮 Tooltip - 仅在 hover 时显示 */}
                          <div 
                            className={`
                              absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 
                              bg-slate-800/90 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl 
                              whitespace-nowrap z-50 pointer-events-none transition-all duration-200
                              ${isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90'}
                            `}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{item.word}</span>
                              <span className="text-primary-300 font-mono">{item.count}</span>
                            </div>
                            {/* 小三角 */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800/90"></div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                </div>

                {/* 控制栏：过滤器和搜索 */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* 词性筛选 */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-600">{t('freqFilterByPos')}:</span>
                      <div className="flex bg-slate-100 rounded-lg p-0.5">
                        {[
                          { value: 'all', label: t('freqFilterAll') },
                          { value: 'noun', label: t('freqFilterNoun') },
                          { value: 'verb', label: t('freqFilterVerb') },
                          { value: 'adj', label: t('freqFilterAdj') }
                        ].map(filter => (
                          <button
                            key={filter.value}
                            onClick={() => setFreqFilter(filter.value as any)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                              freqFilter === filter.value
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-600 hover:bg-white/50'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 搜索框 */}
                    <div className="flex-grow max-w-xs">
                      <input
                        type="text"
                        value={freqSearchKeyword}
                        onChange={(e) => setFreqSearchKeyword(e.target.value)}
                        placeholder={t('freqSearchPlaceholder')}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
                      />
                    </div>

                    {/* 过滤停用词开关 */}
                    <button
                      onClick={() => setFreqFilterStopWords(!freqFilterStopWords)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        freqFilterStopWords
                          ? 'bg-primary-100 text-primary-700 border border-primary-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Filter size={14} />
                      {t('freqToggleStopWords')}
                    </button>
                  </div>
                </div>

                {/* 高频词汇列表 */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800">{t('freqMostCommon')}</h4>
                      <span className="text-xs text-slate-500">{t('freqClickToSearch')}</span>
                    </div>
                  </div>

                  {freqLoading ? (
                    <div className="text-center py-12 text-slate-400">
                      <div className="animate-spin mb-3 inline-block">
                        <BarChart3 size={24} className="text-primary-600" />
                      </div>
                      <p className="text-sm">{t('freqLoading')}</p>
                    </div>
                  ) : freqData.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <BarChart3 size={48} className="mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium">{t('freqNoData')}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3 text-left font-semibold w-[10%]">#</th>
                            <th className="px-4 py-3 text-left font-semibold w-[55%]">{t('freqWordColumn')}</th>
                            <th className="px-4 py-3 text-center font-semibold w-[17.5%]">{t('freqCountColumn')}</th>
                            <th className="px-4 py-3 text-center font-semibold w-[17.5%]">{t('freqPercentColumn')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {freqData.slice(0, 50).map((item, index) => (
                            <tr
                              key={item.word}
                              className={`hover:bg-primary-50/50 transition-colors cursor-pointer ${
                                index < 3 ? 'bg-amber-50/30 font-medium' : ''
                              }`}
                              onClick={() => handleWordClick(item.word)}
                            >
                              <td className="px-4 py-2.5 text-slate-500 text-xs">{index + 1}</td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-700 font-mono truncate">{item.word}</span>
                                  <Search size={12} className="text-slate-400 shrink-0" />
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-center text-slate-600">
                                {item.count.toLocaleString()}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="h-full bg-primary-500 rounded-full transition-all"
                                      style={{ width: `${Math.min(item.percent, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-slate-500 w-10 text-right">
                                    {item.percent}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SamplePreview;