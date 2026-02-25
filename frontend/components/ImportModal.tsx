/**
 * 语料库导入组件
 */
import React, { useState, useRef } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle, X } from 'lucide-react';
import { importSamplesToCorpus } from '../api/import';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  corpusId: number;
  corpusName: string;
  onImportSuccess: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  corpusId,
  corpusName,
  onImportSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.json') && !selectedFile.name.endsWith('.jsonl')) {
        setError('请选择 .json 或 .jsonl 文件');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('请先选择文件');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await importSamplesToCorpus(corpusId, file);
      setSuccess(`成功导入 ${result.imported} 条样本`);
      if (result.errors.length > 0) {
        setError(`部分数据导入失败: ${result.errors.join(', ')}`);
      }
      onImportSuccess();
    } catch (err: any) {
      setError(err.message || '导入失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.json') && !droppedFile.name.endsWith('.jsonl')) {
        setError('请选择 .json 或 .jsonl 文件');
        return;
      }
      setFile(droppedFile);
      setError(null);
      setSuccess(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">导入样本数据</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-2">
              目标语料库: <span className="font-medium text-slate-800">{corpusName}</span>
            </p>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${file
              ? 'border-primary-500 bg-primary-50'
              : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.jsonl"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center">
                <FileJson className="text-primary-500 mb-2" size={32} />
                <p className="text-sm font-medium text-slate-700">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="text-slate-400 mb-2" size={32} />
                <p className="text-sm text-slate-600">
                  点击选择文件或拖拽到此处
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  支持 .json 或 .jsonl 格式
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
              <p className="text-sm text-red-600">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${!file || loading
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600'
              }`}
          >
            {loading ? '导入中...' : '开始导入'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
