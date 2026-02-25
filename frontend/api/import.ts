/**
 * 语料库导入 API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ImportResult {
  imported: number;
  errors: string[];
}

interface CreateCorpusResult {
  corpus_id: number;
  corpus_name: string;
  imported: number;
  errors?: string[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

/**
 * 上传 JSON 文件导入样本到指定语料库
 */
export async function importSamplesToCorpus(
  corpusId: number,
  file: File
): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/corpus/import/${corpusId}`,
    {
      method: 'POST',
      headers,
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    const message = typeof detail === 'string'
      ? detail
      : (Array.isArray(detail) ? detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ') : JSON.stringify(detail));
    throw new Error(message || '导入失败');
  }

  const result: ApiResponse<ImportResult> = await response.json();
  return result.data;
}

/**
 * 创建语料库并导入样本
 */
export async function createCorpusWithSamples(
  name: string,
  description: string,
  sourceLang: string,
  targetLang: string,
  sourceName: string,
  targetName: string,
  domain: string = 'general',
  sourceType: string = 'official',
  isPublic: boolean = true,
  samples: any[] = []
): Promise<CreateCorpusResult> {
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/corpus/create-with-samples`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name,
        description,
        source_lang: sourceLang,
        target_lang: targetLang,
        source_name: sourceName,
        target_name: targetName,
        domain,
        source_type: sourceType,
        is_public: isPublic,
        samples
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    const detail = error.detail;
    const message = typeof detail === 'string'
      ? detail
      : (Array.isArray(detail) ? detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ') : JSON.stringify(detail));
    throw new Error(message || '创建失败');
  }

  const result: ApiResponse<CreateCorpusResult> = await response.json();
  return result.data;
}
