/**
 * Search Results Page Component
 * Displays search results with filters and import functionality
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Download, Link as LinkIcon, ArrowUpDown, ChevronDown, Search, Filter, Loader2, Upload, X, FileJson, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { fetchCorpora, type CorpusItem } from '@/api/corpus';
import { importSamplesToCorpus, createCorpusWithFile } from '@/api/import';
import { encodeId } from '@/router/encoding';

// Local interface for scenario tags used in this component
interface UIScenarioTag {
  label: string;
  type: 'ecommerce' | 'tourism' | 'business' | 'economy' | 'general' | 'terminology' | 'qa' | 'alignment' | 'process' | 'case' | 'struction' | 'audio';
}

const SearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  // Get initial params from URL
  const sourceLang = searchParams.get('source') || '';
  const targetLang = searchParams.get('target') || '';
  const domainParam = searchParams.get('domain') || '';

  // Data state
  const [corpora, setCorpora] = useState<CorpusItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local state for dropdowns
  const [localSource, setLocalSource] = useState(sourceLang);
  const [localTarget, setLocalTarget] = useState(targetLang);
  const [selectedDomain, setSelectedDomain] = useState<string>(domainParam || '');

  // Import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'create'>('append');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // New corpus form state
  const [selectedCorpusId, setSelectedCorpusId] = useState<number>(0);
  const [newCorpus, setNewCorpus] = useState({
    name: '',
    description: '',
    source_lang: 'zh',
    target_lang: 'ms',
    source_name: 'Chinese',
    target_name: 'Malay',
    domain: 'general',
    source_type: 'official',
    is_public: true
  });

  // Sync local state if props change
  useEffect(() => {
    setLocalSource(sourceLang);
    setLocalTarget(targetLang);
  }, [sourceLang, targetLang]);

  // Fetch corpus data from API
  useEffect(() => {
    const loadCorpora = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: {
          source_lang?: string;
          target_lang?: string;
          domain?: string;
          limit?: number;
        } = {
          limit: 100 // 设置一个较大的限制，由于语料库列表通常不会达到成千上万，100 够覆盖大多数场景
        };

        if (sourceLang) params.source_lang = sourceLang;
        if (targetLang) params.target_lang = targetLang;
        if (selectedDomain) params.domain = selectedDomain;

        const result = await fetchCorpora(params);
        setCorpora(result.items);
        setTotalCount(result.total);
      } catch (err) {
        console.error('Failed to fetch corpora:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadCorpora();
  }, [sourceLang, targetLang, selectedDomain]);

  // Refresh data
  const refreshData = async () => {
    try {
      const params: { source_lang?: string; target_lang?: string; domain?: string; limit?: number } = { limit: 100 };
      if (sourceLang) params.source_lang = sourceLang;
      if (targetLang) params.target_lang = targetLang;
      if (selectedDomain) params.domain = selectedDomain;
      const result = await fetchCorpora(params);
      setCorpora(result.items);
      setTotalCount(result.total);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  // Handle search with URL params
  const handleSearch = (domain: string) => {
    const params = new URLSearchParams();
    if (domain) params.set('domain', domain);
    if (localSource) params.set('source', localSource);
    if (localTarget) params.set('target', localTarget);
    navigate(`/search?${params.toString()}`);
  };

  // Handle preview navigation
  const handlePreview = (id: number) => {
    const encodedId = encodeId(id);
    navigate(`/preview/${encodedId}`, {
      state: { from: `/search?${searchParams.toString()}` }
    });
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json') && !file.name.endsWith('.jsonl') && !file.name.endsWith('.parquet')) {
        setImportError('请选择 .json / .jsonl / .parquet 文件');
        return;
      }
      setImportFile(file);
      setImportError(null);
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!importFile) {
      setImportError('请选择文件');
      return;
    }

    if (importMode === 'append' && !selectedCorpusId) {
      setImportError('请选择目标语料库');
      return;
    }

    if (importMode === 'create' && !newCorpus.name) {
      setImportError('请填写语料库名称');
      return;
    }

    setImporting(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      if (importMode === 'create') {
        const result = await createCorpusWithFile(
          newCorpus.name,
          newCorpus.description,
          newCorpus.source_lang,
          newCorpus.target_lang,
          newCorpus.source_name,
          newCorpus.target_name,
          newCorpus.domain,
          newCorpus.source_type,
          newCorpus.is_public,
          importFile
        );
        setImportSuccess(`成功创建语料库 "${result.corpus_name}" 并导入 ${result.imported} 条样本`);
        if (result.errors && result.errors.length > 0) {
          setImportError(`部分数据导入失败: ${result.errors.join(', ')}`);
        }
      } else {
        const result = await importSamplesToCorpus(selectedCorpusId, importFile!);
        setImportSuccess(`成功导入 ${result.imported} 条样本`);
        if (result.errors && result.errors.length > 0) {
          setImportError(`部分数据导入失败: ${result.errors.join(', ')}`);
        }
      }
      await refreshData();
      setImportFile(null);
    } catch (err: any) {
      setImportError(err.message || '导入失败');
    } finally {
      setImporting(false);
    }
  };

  // Close modal
  const closeImportModal = () => {
    setImportModalOpen(false);
    setImportFile(null);
    setImportError(null);
    setImportSuccess(null);
    setImportMode('append');
    setSelectedCorpusId(0);
    setNewCorpus({
      name: '',
      description: '',
      source_lang: 'zh',
      target_lang: 'ms',
      source_name: 'Chinese',
      target_name: 'Malay',
      domain: 'general',
      source_type: 'official',
      is_public: true
    });
  };

  const languages = [
    { code: 'zh', label: t('langChinese') },
    { code: 'en', label: t('langEnglish') },
    { code: 'th', label: t('langThai') },
    { code: 'vi', label: t('langVietnamese') },
    { code: 'ms', label: t('langMalay') },
    { code: 'khm', label: t('langKhmer') },
    { code: 'my', label: t('langMyanmar') },
    { code: 'id', label: t('langIndonesian') },
  ];

  const handleSearchClick = () => {
    handleSearch(selectedDomain);
  };

  const getLangName = (code: string) => {
    switch (code) {
      case 'zh': return 'Chinese (cmn)';
      case 'en': return 'English (en)';
      case 'th': return 'Thai (th)';
      case 'vi': return 'Vietnamese (vi)';
      case 'ms': return 'Malay (ms)';
      case 'khm': return 'Khmer (khm)';
      case 'my': return 'Myanmar (my)';
      case 'id': return 'Indonesian (id)';
      default: return code;
    }
  };

  const getCorpusDisplayName = (name: string) => {
    const match = name.match(/^AUDIO-([a-z]+)$/i);
    if (!match) return name;

    const code = match[1].toLowerCase();
    const labelMap: Record<string, string> = {
      vi: '越南语',
      ms: '马来语',
      th: '泰语',
      khm: '柬埔寨语',
      my: '缅甸语'
    };

    const zhLabel = labelMap[code];
    if (!zhLabel) return name;
    return `${name}-${zhLabel}`;
  };

  // Helper to get badge styles based on tag type
  const getTagStyle = (type: string) => {
    switch (type) {
      case 'ecommerce':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'tourism':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'business':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'economy':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'terminology':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'qa':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'alignment':
        return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'process':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'case':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'struction':
        return 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200';
      case 'audio':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20">

      {/* Search Bar Section */}
      <div className="w-full bg-white border-b border-slate-200 py-6 px-6 md:px-12">
        <div className="max-w-4xl">
          <div className="flex flex-col md:flex-row gap-4">

            {/* Category (Domain) Selector */}
            <div className="flex-[2] relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Filter size={18} />
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400 group-hover:text-primary-600">
                <ChevronDown size={18} />
              </div>
              <select
                className="block w-full pl-10 pr-10 py-3 text-base border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 rounded-xl bg-slate-50 hover:bg-white border transition-all appearance-none text-slate-700 font-mono shadow-sm"
                value={selectedDomain}
                onChange={(e) => {
                  setSelectedDomain(e.target.value);
                  handleSearch(e.target.value);
                }}
              >
                <option value="">{t('domainAll')}</option>
                <option value="terminology">{t('catTerminology')}</option>
                <option value="qa">{t('catQA')}</option>
                <option value="alignment">{t('catAlignment')}</option>
                <option value="process">{t('catProcess')}</option>
                <option value="case">{t('catCase')}</option>
                <option value="struction">{t('catInstruction')}</option>
                <option value="audio">{t('catAudio')}</option>
              </select>
            </div>

            {/* Optional Language Filters (Simplified) */}
            <div className="flex-1 flex gap-2">
              <select
                className="flex-1 px-3 py-3 text-sm border-slate-200 rounded-xl bg-slate-50 hover:bg-white border focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-mono text-slate-600"
                value={localSource}
                onChange={(e) => {
                  setLocalSource(e.target.value);
                  const params = new URLSearchParams(searchParams);
                  if (e.target.value) params.set('source', e.target.value);
                  else params.delete('source');
                  navigate(`/search?${params.toString()}`);
                }}
              >
                <option value="">源语言 (任意)</option>
                {languages.map(lang => <option key={`s-${lang.code}`} value={lang.code}>{lang.label}</option>)}
              </select>

              <select
                className="flex-1 px-3 py-3 text-sm border-slate-200 rounded-xl bg-slate-50 hover:bg-white border focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none font-mono text-slate-600"
                value={localTarget}
                onChange={(e) => {
                  setLocalTarget(e.target.value);
                  const params = new URLSearchParams(searchParams);
                  if (e.target.value) params.set('target', e.target.value);
                  else params.delete('target');
                  navigate(`/search?${params.toString()}`);
                }}
              >
                <option value="">目标语言 (任意)</option>
                {languages.map(lang => <option key={`t-${lang.code}`} value={lang.code}>{lang.label}</option>)}
              </select>
            </div>

            <button
              onClick={() => handleSearch(selectedDomain)}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl shadow-md hover:bg-primary-700 transition-all flex items-center justify-center gap-2 font-bold"
            >
              <Search size={18} />
              <span>搜索</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header Info */}
      <div className="w-full bg-white border-b border-slate-200 py-10 px-6 md:px-12">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="animate-spin text-primary-600 mr-2" size={24} />
            <span className="text-slate-500 font-mono">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <span className="text-red-500 font-mono">Error: {error}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 font-mono tracking-tight">
              {t('resourcesFound').replace('{count}', totalCount.toString())}:
              {selectedDomain && <span className="text-primary-600 ml-2">[{selectedDomain.toUpperCase()}]</span>}
              {sourceLang && <span className="text-slate-400 ml-2"> {getLangName(sourceLang)}</span>}
              {targetLang && <span className="text-slate-400"> - {getLangName(targetLang)}</span>}
              <span className="text-slate-300 text-lg ml-3">({totalCount} items)</span>
            </h2>
            <button
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-primary-600 hover:to-primary-700 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <Upload size={16} className="stroke-2" />
              导入语料
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="w-full px-6 md:px-12 mt-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono items-center">
            <div className="col-span-3 lg:col-span-6 flex items-center cursor-pointer hover:text-slate-700">
              {t('headerCorpus')}
            </div>
            <div className="col-span-2 lg:col-span-1 text-center flex items-center justify-center cursor-pointer hover:text-slate-700 group">
              {t('headerSentences')}
              <ArrowUpDown size={12} className="ml-1 opacity-0 group-hover:opacity-100" />
            </div>
            <div className="col-span-2 lg:col-span-1 text-center">{t('headerSample')}</div>
            <div className="col-span-3 lg:col-span-2 text-center">{t('headerBilingual')}</div>
            <div className="col-span-2 text-center hidden xl:block">{t('headerMonolingual')}</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100">
            {corpora.length > 0 ? corpora.map((item, idx) => (
              <div key={item.id} className={`grid grid-cols-12 gap-4 px-6 py-5 items-start hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>

                {/* Corpus Name & Tags */}
                <div className="col-span-3 lg:col-span-6 flex flex-col space-y-2">
                  <div className="font-mono text-sm font-semibold text-slate-800 break-words">
                    {getCorpusDisplayName(item.name)}
                  </div>
                  {/* Scenario Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags && item.tags.map((tag: any, tagIdx: number) => (
                      <span
                        key={tagIdx}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getTagStyle(tag.type)}`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sentences */}
                <div className="col-span-2 lg:col-span-1 text-center font-mono text-sm text-slate-600 mt-1">
                  {item.sentences}
                </div>

                {/* Sample */}
                <div className="col-span-2 lg:col-span-1 flex justify-center mt-1">
                  <button
                    onClick={() => handlePreview(item.id)}
                    className="p-2 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-full transition-colors"
                    title="View Sample"
                  >
                    <Eye size={18} />
                  </button>
                </div>

                {/* Bilingual */}
                <div className="col-span-3 lg:col-span-2 flex items-center justify-center space-x-2 mt-1">
                  <div className="relative group/dropdown">
                    <button className="flex items-center px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs font-mono text-slate-600 hover:border-primary-300 focus:outline-none">
                      tmos <ChevronDown size={12} className="ml-1" />
                    </button>
                    {/* Fake Dropdown content */}
                    <div className="absolute top-full left-0 w-32 bg-white border border-slate-200 shadow-lg rounded-md mt-1 hidden group-hover/dropdown:block z-10">
                      <div className="px-3 py-2 hover:bg-slate-50 text-xs font-mono cursor-pointer">tmx</div>
                      <div className="px-3 py-2 hover:bg-slate-50 text-xs font-mono cursor-pointer">xliff</div>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                    <Download size={18} />
                  </button>
                  <button className="p-2 text-slate-300 hover:text-primary-600 transition-colors">
                    <LinkIcon size={16} />
                  </button>
                </div>

                {/* Monolingual (Hidden on smaller screens, shown on XL) */}
                <div className="col-span-2 hidden xl:flex items-center justify-center space-x-2 mt-1">
                  <div className="relative group/dropdown">
                    <button className="flex items-center px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs font-mono text-slate-600 hover:border-primary-300 focus:outline-none">
                      txt {sourceLang} <ChevronDown size={12} className="ml-1" />
                    </button>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                    <Download size={18} />
                  </button>
                  <button className="p-2 text-slate-300 hover:text-primary-600 transition-colors">
                    <LinkIcon size={16} />
                  </button>
                </div>

              </div>
            )) : (
              <div className="px-6 py-12 text-center text-slate-400 font-mono text-sm">
                No results found for this domain filter.
              </div>
            )}
          </div>

          {/* Footer of table */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 font-mono text-center">
            End of results
          </div>
        </div>
      </div>

      {/* 导入弹窗 */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-800">导入语料数据</h3>
              <button onClick={closeImportModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* 模式选择 */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setImportMode('append')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${importMode === 'append'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="font-medium">追加到现有语料库</div>
                  <div className="text-sm text-slate-500 mt-1">选择已有语料库，上传文件追加数据</div>
                </button>
                <button
                  onClick={() => setImportMode('create')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${importMode === 'create'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="font-medium">新建语料库</div>
                  <div className="text-sm text-slate-500 mt-1">创建新语料库并导入数据</div>
                </button>
              </div>

              {/* 追加模式：选择语料库 */}
              {importMode === 'append' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">选择目标语料库 *</label>
                  <select
                    value={selectedCorpusId}
                    onChange={(e) => setSelectedCorpusId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={0}>-- 请选择语料库 --</option>
                    {corpora.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 新建语料库表单 */}
              {importMode === 'create' && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">语料库名称 *</label>
                    <input
                      type="text"
                      value={newCorpus.name}
                      onChange={(e) => setNewCorpus({ ...newCorpus, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="例如：Shopee 电商对话语料"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
                    <textarea
                      value={newCorpus.description}
                      onChange={(e) => setNewCorpus({ ...newCorpus, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={2}
                      placeholder="语料库描述..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">源语言</label>
                    <select
                      value={newCorpus.source_lang}
                      onChange={(e) => setNewCorpus({ ...newCorpus, source_lang: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">目标语言</label>
                    <select
                      value={newCorpus.target_lang}
                      onChange={(e) => setNewCorpus({ ...newCorpus, target_lang: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">领域</label>
                    <select
                      value={newCorpus.domain}
                      onChange={(e) => setNewCorpus({ ...newCorpus, domain: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="general">通用文本</option>
                      <option value="terminology">{t('catTerminology')}</option>
                      <option value="qa">{t('catQA')}</option>
                      <option value="alignment">{t('catAlignment')}</option>
                      <option value="process">{t('catProcess')}</option>
                      <option value="case">{t('catCase')}</option>
                      <option value="struction">{t('catInstruction')}</option>
                      <option value="audio">{t('catAudio')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">数据来源</label>
                    <select
                      value={newCorpus.source_type}
                      onChange={(e) => setNewCorpus({ ...newCorpus, source_type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="official">官方</option>
                      <option value="community">社区</option>
                      <option value="synthetic">合成</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 文件上传 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">选择文件 *</label>
                <div
                  onClick={() => document.getElementById('import-file-input')?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      if (!file.name.endsWith('.json') && !file.name.endsWith('.jsonl') && !file.name.endsWith('.parquet')) {
                        setImportError('请选择 .json / .jsonl / .parquet 文件');
                        return;
                      }
                      setImportFile(file);
                      setImportError(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      if (!file.name.endsWith('.json') && !file.name.endsWith('.jsonl') && !file.name.endsWith('.parquet')) {
                        setImportError('请选择 .json / .jsonl / .parquet 文件');
                        return;
                      }
                      setImportFile(file);
                      setImportError(null);
                    }
                  }}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${importFile
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
                    }`}
                >
                  <input
                    id="import-file-input"
                    type="file"
                    accept=".json,.jsonl,.parquet"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {importFile ? (
                    <div className="flex flex-col items-center">
                      <FileJson className="text-primary-500 mb-2" size={32} />
                      <p className="text-sm font-medium text-slate-700">{importFile.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{(importFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="text-slate-400 mb-2" size={32} />
                      <p className="text-sm text-slate-600">点击选择文件或拖拽到此处</p>
                      <p className="text-xs text-slate-400 mt-1">支持 .json / .jsonl / .parquet 格式</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 错误/成功提示 */}
              {importError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
                  <p className="text-sm text-red-600">
                    {typeof importError === 'string' ? importError : JSON.stringify(importError)}
                  </p>
                </div>
              )}
              {importSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <Upload className="text-green-500 flex-shrink-0" size={16} />
                  <p className="text-sm text-green-600">{importSuccess}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 sticky bottom-0 bg-white">
              <button
                onClick={closeImportModal}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                取消
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !importFile || (importMode === 'append' && !selectedCorpusId) || (importMode === 'create' && !newCorpus.name)}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${(importing || (!importFile) || (importMode === 'create' && !newCorpus.name))
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600'
                  }`}
              >
                {importing ? '导入中...' : '开始导入'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
