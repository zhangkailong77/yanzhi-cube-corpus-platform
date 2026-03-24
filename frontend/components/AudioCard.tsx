import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import WaveSurfer from 'wavesurfer.js';
import { AudioLines, Check, CirclePause, CirclePlay, Copy, Mic2 } from 'lucide-react';
import { saveAudioTranscript } from '@/api/corpus';
import { useAuth } from '@/contexts/AuthContext';

interface AudioCardProps {
  corpusId: number;
  audio: {
    audio_id: string;
    audio_url: string;
    transcript?: string;
    original_transcript?: string;
    duration_seconds?: string;
    language?: string;
    annotated?: boolean;
    annotated_by?: string;
    annotated_at?: string;
    annotation_date?: string;
    edit_notes?: Array<{ from_word: string; to_word: string; explanation?: string }>;
  };
}

interface EditNoteItem {
  from_word: string;
  to_word: string;
  explanation?: string;
}

const WORD_EDITOR_STYLE_ID = 'audio-word-editor-fx-style';
const WORD_EDITOR_STYLE_TEXT = `
.yz-word-editor-shell {
  width: 320px;
  transform-origin: 50% 100%;
  animation: yzTooltipPopIn 0.3s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

.yz-word-editor-shell[data-placement='bottom'] {
  transform-origin: 50% 0%;
}

.yz-word-editor-card {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.16);
  padding: 10px 11px;
}

.yz-word-editor-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: transparent;
  pointer-events: none;
}

.yz-word-editor-content {
  position: relative;
  z-index: 1;
  padding: 0;
}

.yz-word-editor-strong-text {
  color: #1e293b;
  font-weight: 700;
  text-shadow: none;
}

.yz-word-editor-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
}

.yz-word-editor-arrow.down {
  bottom: -7px;
  border-top: 7px solid #ffffff;
}

.yz-word-editor-arrow.up {
  top: -7px;
  border-bottom: 7px solid #ffffff;
}

@keyframes yzCoolfadeIn {
  0% { opacity: 0; transform: translateY(4px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes yzTooltipPopIn {
  0% {
    opacity: 0;
    transform: translateY(14px) scale(0.96);
    filter: blur(2px);
  }
  65% {
    opacity: 1;
    transform: translateY(-2px) scale(1.01);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
`;

const splitTokens = (text: string): string[] => text.split(/(\s+)/).filter((token) => token.length > 0);
const isWhitespace = (token: string): boolean => /^\s+$/.test(token);
const getWordPositionByTokenIndex = (tokens: string[], tokenIndex: number): number => {
  let position = -1;
  for (let i = 0; i <= tokenIndex; i += 1) {
    if (!isWhitespace(tokens[i])) {
      position += 1;
    }
  }
  return position;
};
const getWordByPosition = (text: string, wordPosition: number): string => {
  if (wordPosition < 0) return '';
  const words = splitTokens(text).filter((token) => !isWhitespace(token));
  return words[wordPosition] || '';
};
const formatAnnotationDate = (rawDate?: string, rawDateTime?: string): string => {
  if (rawDate && rawDate.trim()) return rawDate.trim();
  if (!rawDateTime) return '-';
  const parsed = new Date(rawDateTime);
  if (Number.isNaN(parsed.getTime())) return '-';
  return `${parsed.getFullYear()}-${`${parsed.getMonth() + 1}`.padStart(2, '0')}-${`${parsed.getDate()}`.padStart(2, '0')}`;
};
const formatAnnotationDateTime = (rawDate?: string, rawDateTime?: string): string => {
  if (rawDateTime) {
    const parsed = new Date(rawDateTime);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = `${parsed.getMonth() + 1}`.padStart(2, '0');
      const d = `${parsed.getDate()}`.padStart(2, '0');
      const hh = `${parsed.getHours()}`.padStart(2, '0');
      const mm = `${parsed.getMinutes()}`.padStart(2, '0');
      return `${y}-${m}-${d} ${hh}:${mm}`;
    }
  }
  if (rawDate && rawDate.trim()) {
    return `${rawDate.trim()} 00:00`;
  }
  return '-';
};

const getChangedTokenIndexes = (beforeText: string, afterText: string): Set<number> => {
  const beforeAll = splitTokens(beforeText);
  const afterAll = splitTokens(afterText);

  const before = beforeAll.filter((token) => !isWhitespace(token));
  const after = afterAll.filter((token) => !isWhitespace(token));

  const m = before.length;
  const n = after.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array.from({ length: n + 1 }, () => 0));

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      if (before[i - 1] === after[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const keptAfterIndexes = new Set<number>();
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (before[i - 1] === after[j - 1]) {
      keptAfterIndexes.add(j - 1);
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i -= 1;
    } else {
      j -= 1;
    }
  }

  const changedWordIndexes = new Set<number>();
  for (let index = 0; index < after.length; index += 1) {
    if (!keptAfterIndexes.has(index)) {
      changedWordIndexes.add(index);
    }
  }

  const changedTokenIndexes = new Set<number>();
  let wordPointer = 0;
  for (let tokenIndex = 0; tokenIndex < afterAll.length; tokenIndex += 1) {
    if (isWhitespace(afterAll[tokenIndex])) {
      continue;
    }
    if (changedWordIndexes.has(wordPointer)) {
      changedTokenIndexes.add(tokenIndex);
    }
    wordPointer += 1;
  }
  return changedTokenIndexes;
};

const AudioCard: React.FC<AudioCardProps> = ({ audio, corpusId }) => {
  const { user } = useAuth();
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const backendBase = apiBase.replace(/\/api\/?$/, '');
  const resolvedAudioUrl = audio.audio_url.startsWith('http')
    ? audio.audio_url
    : audio.audio_url.startsWith('/voicedatas/')
      ? audio.audio_url
      : `${backendBase}${audio.audio_url.startsWith('/') ? '' : '/'}${audio.audio_url}`;
  const cardRef = useRef<HTMLDivElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const transcriptBoxRef = useRef<HTMLDivElement | null>(null);
  const editorPopupRef = useRef<HTMLDivElement | null>(null);
  const editorInputRef = useRef<HTMLInputElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [localTranscript, setLocalTranscript] = useState(audio.transcript || '');
  const [changedTokenIndexes, setChangedTokenIndexes] = useState<Set<number>>(new Set());
  const [editingTokenIndex, setEditingTokenIndex] = useState<number | null>(null);
  const [draftWord, setDraftWord] = useState('');
  const [draftExplanation, setDraftExplanation] = useState('');
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [popupPlacement, setPopupPlacement] = useState<'top' | 'bottom'>('top');
  const [arrowOffset, setArrowOffset] = useState(140);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [baselineTranscript, setBaselineTranscript] = useState(audio.original_transcript || audio.transcript || '');
  const annotatorName = useMemo(() => {
    if (user?.display_name && user.display_name.trim()) {
      return user.display_name.trim();
    }
    if (user?.username) {
      return user.username;
    }
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return '';
      const parsed = JSON.parse(raw) as { username?: string; display_name?: string | null };
      const displayName = parsed?.display_name?.trim();
      if (displayName) {
        return displayName;
      }
      return parsed?.username || '';
    } catch {
      return '';
    }
  }, [user?.display_name, user?.username]);
  const [annotationMeta, setAnnotationMeta] = useState<{
    annotated: boolean;
    annotatedBy: string;
    annotationDate: string;
    annotationDateTime: string;
  }>({
    annotated: Boolean(audio.annotated),
    annotatedBy: audio.annotated_by || '',
    annotationDate: formatAnnotationDate(audio.annotation_date, audio.annotated_at),
    annotationDateTime: formatAnnotationDateTime(audio.annotation_date, audio.annotated_at)
  });
  const [editNotes, setEditNotes] = useState<EditNoteItem[]>(audio.edit_notes || []);

  const displayTranscript = useMemo(
    () => localTranscript || 'No transcript available.',
    [localTranscript]
  );
  const transcriptTokens = useMemo(() => splitTokens(localTranscript), [localTranscript]);
  const annotationDisplayName = useMemo(() => {
    const rawName = (annotationMeta.annotatedBy || '').trim();
    if (!rawName) return '未知用户';
    if (user?.display_name && user?.username && rawName === user.username) {
      return user.display_name;
    }
    return rawName;
  }, [annotationMeta.annotatedBy, user?.display_name, user?.username]);
  const annotationDisplayDate = annotationMeta.annotationDate || '-';
  const annotationDisplayDateTime = annotationMeta.annotationDateTime || '-';

  useEffect(() => {
    const nextTranscript = audio.transcript || '';
    const nextBaseline = audio.original_transcript || audio.transcript || '';
    setLocalTranscript(nextTranscript);
    setBaselineTranscript(nextBaseline);
    setChangedTokenIndexes(getChangedTokenIndexes(nextBaseline, nextTranscript));
    setEditingTokenIndex(null);
    setDraftWord('');
    setDraftExplanation('');
    setPopupPosition(null);
    setSaveError(null);
    setAnnotationMeta({
      annotated: Boolean(audio.annotated),
      annotatedBy: audio.annotated_by || '',
      annotationDate: formatAnnotationDate(audio.annotation_date, audio.annotated_at),
      annotationDateTime: formatAnnotationDateTime(audio.annotation_date, audio.annotated_at)
    });
    setEditNotes(audio.edit_notes || []);
  }, [
    audio.transcript,
    audio.original_transcript,
    audio.audio_id,
    audio.annotated,
    audio.annotated_by,
    audio.annotation_date,
    audio.annotated_at,
    audio.edit_notes
  ]);

  const formatTime = (seconds: number): string => {
    const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !waveformRef.current || waveSurferRef.current) return;

    const wave = WaveSurfer.create({
      container: waveformRef.current,
      url: resolvedAudioUrl,
      waveColor: '#d7deea',
      progressColor: '#2563eb',
      cursorColor: 'transparent',
      barWidth: 5,
      barGap: 3,
      barRadius: 10,
      height: 54,
      normalize: true,
      dragToSeek: true,
    });

    wave.on('ready', () => {
      setIsReady(true);
      setDuration(wave.getDuration());
    });
    wave.on('play', () => setIsPlaying(true));
    wave.on('pause', () => setIsPlaying(false));
    wave.on('finish', () => {
      setIsPlaying(false);
      setCurrentTime(wave.getDuration());
    });
    wave.on('timeupdate', (time: number) => {
      setCurrentTime(time);
    });

    waveSurferRef.current = wave;

    return () => {
      wave.destroy();
      waveSurferRef.current = null;
    };
  }, [isVisible, resolvedAudioUrl]);

  const handlePlayPause = async (): Promise<void> => {
    const wave = waveSurferRef.current;
    if (!wave || !isReady) return;
    await wave.playPause();
  };

  const handleWordClick = (tokenIndex: number, token: string, event: React.MouseEvent<HTMLButtonElement>): void => {
    if (saving) return;
    const tokenRect = event.currentTarget.getBoundingClientRect();
    const popupWidth = 248;
    const popupHeight = 194;
    const viewportPadding = 12;
    const centerX = tokenRect.left + tokenRect.width / 2;
    const preferredLeft = centerX - popupWidth / 2;
    const clampedLeft = Math.min(
      Math.max(viewportPadding, preferredLeft),
      window.innerWidth - popupWidth - viewportPadding
    );
    const preferredTop = tokenRect.top - popupHeight - 10;
    const isTop = preferredTop > viewportPadding;
    const top = isTop
      ? preferredTop
      : Math.min(tokenRect.bottom + 4, window.innerHeight - popupHeight - viewportPadding);

    const desiredArrowOffset = centerX - clampedLeft;
    const clampedArrowOffset = Math.min(Math.max(16, desiredArrowOffset), popupWidth - 16);

    setEditingTokenIndex(tokenIndex);
    setDraftWord(token);
    const existingNote = editNotes.find((item) => item.to_word === token || item.from_word === token);
    setDraftExplanation(existingNote?.explanation || '');
    setPopupPosition({
      x: clampedLeft,
      y: top
    });
    setPopupPlacement(isTop ? 'top' : 'bottom');
    setArrowOffset(clampedArrowOffset);
    setSaveError(null);
  };

  const closeEditor = (): void => {
    setEditingTokenIndex(null);
    setDraftWord('');
    setDraftExplanation('');
    setPopupPosition(null);
    setSaveError(null);
  };

  const handleSaveWord = async (): Promise<void> => {
    if (editingTokenIndex === null || saving || !corpusId) return;
    const tokens = splitTokens(localTranscript);
    if (!tokens[editingTokenIndex]) return;
    const originalWord = tokens[editingTokenIndex];
    const wordPosition = getWordPositionByTokenIndex(tokens, editingTokenIndex);
    const baselineWordAtPosition = getWordByPosition(baselineTranscript, wordPosition);
    tokens[editingTokenIndex] = draftWord;
    const nextTranscript = tokens.join('');
    const normalizedOriginalWord = (originalWord || '').trim();
    const normalizedNextWord = (draftWord || '').trim();
    const normalizedBaselineWord = (baselineWordAtPosition || normalizedOriginalWord).trim();
    const hasExplanation = (draftExplanation || '').trim().length > 0;
    const shouldSaveEditNote = normalizedBaselineWord && normalizedNextWord && (
      normalizedBaselineWord !== normalizedNextWord || hasExplanation
    );
    const editNotePayload = shouldSaveEditNote
      ? {
          from_word: normalizedBaselineWord,
          to_word: normalizedNextWord,
          explanation: (draftExplanation || '').trim()
        }
      : undefined;

    setSaving(true);
    setSaveError(null);
    try {
      const result = await saveAudioTranscript(
        corpusId,
        audio.audio_id,
        nextTranscript,
        annotatorName,
        editNotePayload
      );
      const finalTranscript = result.transcript || nextTranscript;
      setLocalTranscript(finalTranscript);
      setChangedTokenIndexes(getChangedTokenIndexes(baselineTranscript, finalTranscript));
      setAnnotationMeta({
        annotated: Boolean(result.annotated),
        annotatedBy: result.annotated_by || annotatorName || '',
        annotationDate: formatAnnotationDate(result.annotation_date, result.annotated_at),
        annotationDateTime: formatAnnotationDateTime(result.annotation_date, result.annotated_at)
      });
      if (result.edit_notes) {
        setEditNotes(result.edit_notes);
      } else if (editNotePayload) {
        const nextNotes = editNotes.filter((item) => !(
          item.from_word === editNotePayload.from_word &&
          item.to_word === editNotePayload.to_word
        ));
        nextNotes.push(editNotePayload);
        setEditNotes(nextNotes.slice(-20));
      }
      closeEditor();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent): void => {
      if (!editorPopupRef.current) return;
      if (!editorPopupRef.current.contains(event.target as Node)) {
        closeEditor();
      }
    };

    const onEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeEditor();
      }
    };

    if (editingTokenIndex !== null) {
      window.addEventListener('mousedown', onClickOutside);
      window.addEventListener('keydown', onEscape);
    }

    return () => {
      window.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onEscape);
    };
  }, [editingTokenIndex]);

  useEffect(() => {
    if (editingTokenIndex === null) return;
    const input = editorInputRef.current;
    if (!input) return;
    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }
  }, [editingTokenIndex]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(WORD_EDITOR_STYLE_ID)) return;
    const styleTag = document.createElement('style');
    styleTag.id = WORD_EDITOR_STYLE_ID;
    styleTag.textContent = WORD_EDITOR_STYLE_TEXT;
    document.head.appendChild(styleTag);
  }, []);

  return (
    <div ref={cardRef} className="group bg-white rounded-[20px] border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="px-6 py-5 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold tracking-wide">
              <AudioLines size={15} />
              AUDIO
            </span>
            <span className="text-slate-400 text-xl font-extrabold tracking-wide leading-none">
              #{audio.audio_id}
            </span>
          </div>
          {annotationMeta.annotated ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[11px] font-semibold leading-4 text-slate-600">
                  标注人：{annotationDisplayName}
                </p>
                <p className="mt-1 text-[11px] leading-4 text-slate-500">
                  标注时间：{annotationDisplayDateTime}
                </p>
              </div>
              <div
                className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-600 border border-blue-500 flex items-center justify-center text-white rotate-6 shadow-[0_8px_20px_rgba(37,99,235,0.28)] transition-all duration-500 group-hover:scale-105"
                title={`已标注 · ${annotationDisplayName} · ${annotationDisplayDate}`}
              >
                <Check size={28} strokeWidth={2.8} />
              </div>
            </div>
          ) : (
            <button
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="复制音频ID"
              onClick={() => navigator.clipboard?.writeText(audio.audio_id)}
            >
              <Copy size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPause}
            disabled={!isReady}
            className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            {isPlaying ? <CirclePause size={24} /> : <CirclePlay size={24} />}
          </button>
          <span className="text-sm font-semibold text-slate-500 w-11 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 min-w-0">
            <div ref={waveformRef} />
          </div>
          <span className="text-sm font-semibold text-slate-500 w-11">{formatTime(duration)}</span>
        </div>

        <div ref={transcriptBoxRef} className="bg-slate-50 rounded-xl px-4 py-4 border border-slate-100 relative">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold mb-2">
            <Mic2 size={14} />
            Speaker A
          </div>
          {localTranscript ? (
            <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
              {transcriptTokens.map((token, index) => {
                if (isWhitespace(token)) {
                  return <span key={`${audio.audio_id}-space-${index}`}>{token}</span>;
                }
                return (
                  <button
                    key={`${audio.audio_id}-token-${index}`}
                    type="button"
                    onClick={(event) => handleWordClick(index, token, event)}
                    className={`inline rounded px-0.5 cursor-pointer transition-all ${
                      changedTokenIndexes.has(index)
                        ? 'text-red-600 font-semibold'
                        : 'text-slate-700'
                    } hover:bg-slate-200 hover:shadow-sm`}
                  >
                    {token}
                  </button>
                );
              })}
            </p>
          ) : (
            <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
              {displayTranscript}
            </p>
          )}
        </div>
        {editNotes.length > 0 && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/55 px-4 py-3">
            <p className="text-xs font-semibold text-blue-700">标注修改词性解释</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {editNotes.map((note, index) => (
                <span
                  key={`${audio.audio_id}-note-${note.from_word}-${note.to_word}-${index}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-200/80 bg-white/80 px-2.5 py-1.5 text-sm text-blue-700"
                >
                  <span className="font-bold tracking-wide">{note.from_word}</span>
                  <span className="text-blue-500">→</span>
                  <span className="font-bold tracking-wide">{note.to_word}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600 font-medium">{note.explanation || '未填写解释'}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      {editingTokenIndex !== null && popupPosition && createPortal(
        <div
          ref={editorPopupRef}
          className="fixed z-[80] yz-word-editor-shell"
          data-placement={popupPlacement}
          style={{ left: popupPosition.x, top: popupPosition.y }}
        >
          <div
            className={`yz-word-editor-arrow ${popupPlacement === 'top' ? 'down' : 'up'}`}
            style={{ left: `${arrowOffset - 7}px` }}
          />
          <div className="yz-word-editor-card">
            <div className="yz-word-editor-content">
              <p className="yz-word-editor-strong-text mb-2 text-xs tracking-wide">编辑当前词</p>
              <input
                ref={editorInputRef}
                value={draftWord}
                onChange={(event) => setDraftWord(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <textarea
                value={draftExplanation}
                onChange={(event) => setDraftExplanation(event.target.value)}
                rows={2}
                className="mt-2 min-h-16 w-full resize-none rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm leading-5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="词性解释（可选）"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveWord}
                  disabled={saving}
                  className="yz-word-editor-strong-text w-24 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="yz-word-editor-strong-text w-24 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  取消
                </button>
              </div>
              {saveError && <p className="mt-2 text-right text-xs text-red-600">{saveError}</p>}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AudioCard;
