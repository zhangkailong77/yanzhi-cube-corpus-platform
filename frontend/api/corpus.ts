/**
 * 语料库 API 客户端
 */

const API_BASE_URL = 'http://localhost:8000/api';

// 类型定义
export interface ScenarioTag {
  label: string;
  type: string;
}

export interface CorpusItem {
  id: number;
  name: string;
  sentences: string;
  sTok: string;
  tTok: string;
  tags: ScenarioTag[];
  domain: string;
  source_type: string;
  is_public: boolean;
}

export interface CorpusListResponse {
  items: CorpusItem[];
  total: number;
  page: number;
  limit: number;
}

export interface BasicLayer {
  sentence_id: string;
  timestamp: string | null;
  platform: string | null;
}

export interface LanguageLayer {
  source_text_zh: string;
  raw_text_ms: string;
  normalized_text_ms: string;
  english_loanwords: string[];
}

export interface PragmaticLayer {
  intent: string[];
  sentiment: string;
  business_scenario: string | null;
}

export interface StyleLayer {
  style: string | null;
  contains_rojak: boolean;
  abbreviations_handled: Record<string, string>;
}

export interface CorpusSample {
  basic_layer: BasicLayer;
  language_layer: LanguageLayer;
  pragmatic_layer: PragmaticLayer;
  style_layer: StyleLayer;
}

export interface SampleListResponse {
  items: CorpusSample[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoryStat {
  name: string;
  sentences: string;
  percent: string;
}

export interface DashboardOverviewResponse {
  corpus_count: string;
  total_pairs: string;
  language_count: string;
  categories: CategoryStat[];
}

export interface DashboardStatsResponse {
  total_sentences: string;
  sentences_growth: string;
  avg_quality_score: string;
  quality_target: string;
  localization_value: string;
  timeline_data: { month: string; count: number }[];
  intents: { label: string; val: number; w: string }[];
  sentiment_distribution: Record<string, number>;
  channel_sentiment: { channel: string; positive: number; negative: number; score: number }[];
  samples: CorpusSample[];
  loanwords: { word: string; count: number }[];
  normalization_map: { source: string; target: string; count: number }[];
  style_distribution: { scenario: string; colloquial: number; formal: number }[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

// 通用请求函数
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // 获取 token
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    // 网络错误
    throw new Error('无权访问此语料库');
  }

  if (!response.ok) {
    // 尝试读取后端返回的错误信息
    try {
      const errorResult = await response.json();
      const errorMessage = errorResult.detail || errorResult.message || response.statusText;
      throw new Error(errorMessage);
    } catch (err) {
      // 如果已经是我们抛出的 Error，直接重新抛出
      if (err instanceof Error && (err.message === '无权访问此语料库' || err.message.includes('403'))) {
        throw err;
      }
      // 其他情况抛出通用错误
      throw new Error(`请求失败: ${response.status}`);
    }
  }

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }

  return result.data;
}

// ===================== API 函数 =====================

/**
 * 获取语料库列表
 */
export async function fetchCorpora(params?: {
  source_lang?: string;
  target_lang?: string;
  domain?: string;
  source_type?: string;
  is_public?: boolean;
  page?: number;
  limit?: number;
}): Promise<CorpusListResponse> {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }

  const query = searchParams.toString();
  const endpoint = `/corpus${query ? `?${query}` : ''}`;

  return apiRequest<CorpusListResponse>(endpoint);
}

/**
 * 获取单个语料库详情
 */
export async function fetchCorpusDetail(corpusId: number): Promise<CorpusItem> {
  const endpoint = `/corpus/${corpusId}`;
  return apiRequest<CorpusItem>(endpoint);
}

/**
 * 获取语料样本列表
 */
export async function fetchCorpusSamples(
  corpusId: number,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<SampleListResponse> {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }

  const query = searchParams.toString();
  const endpoint = `/corpus/${corpusId}/samples${query ? `?${query}` : ''}`;

  return apiRequest<SampleListResponse>(endpoint);
}

/**
 * 获取首页统计概览
 */
export async function fetchOverviewStats(): Promise<DashboardOverviewResponse> {
  return apiRequest<DashboardOverviewResponse>('/statistics/overview');
}

/**
 * 获取仪表盘详细统计
 */
export async function fetchDashboardStats(): Promise<DashboardStatsResponse> {
  return apiRequest<DashboardStatsResponse>('/dashboard/stats');
}

/**
 * KWIC 分析参数接口
 */
export interface KWICSearchParams {
  keyword: string;
  context_window?: 3 | 5 | 7;
  domain?: string;
  page?: number;
  limit?: number;
}

/**
 * KWIC 结果项接口
 */
export interface KWICResultItem {
  sentence_id: string;
  left_context: string;
  keyword: string;
  right_context: string;
  full_data?: {
    sentence_id: string;
    timestamp: string;
    platform: string;
    intent: string[];
    sentiment: string;
    business_scenario: string | null;
    source_text_zh: string;
    raw_text_ms: string;
    normalized_text_ms: string;
    english_loanwords: string[];
  };
}

/**
 * KWIC 响应接口
 */
export interface KWICResponse {
  items: KWICResultItem[];
  total: number;
  keyword: string;
  page: number;
  limit: number;
  domain?: string;
}

/**
 * 获取 KWIC 分析结果
 */
export async function fetchKWICAnalysis(
  corpusId: number,
  params: KWICSearchParams
): Promise<KWICResponse> {
  const searchParams = new URLSearchParams();

  if (params.keyword) searchParams.append('keyword', params.keyword);
  if (params.context_window) searchParams.append('context_window', String(params.context_window || 5));
  if (params.domain) searchParams.append('domain', params.domain);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit || 50));

  const query = searchParams.toString();
  const endpoint = `/corpus/${corpusId}/kwic/analysis?${query}`;

  return apiRequest<KWICResponse>(endpoint);
}
