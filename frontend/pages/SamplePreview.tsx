/**
 * Sample Preview Page Component
 * Wraps SamplePreview component with router parameter extraction
 */
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SamplePreview from '@/components/SamplePreview';
import { fetchCorpusDetail } from '@/api/corpus';
import { decodeId } from '@/router/encoding';

export default function SamplePreviewPage() {
  const { encodedId } = useParams<{ encodedId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const corpusId = encodedId ? decodeId(encodedId) : null;

  const handleBack = async () => {
    // Try to use from state first, otherwise get corpus info and build search URL
    const fromPath = (location.state as any)?.from;
    if (fromPath) {
      navigate(fromPath);
    } else if (corpusId) {
      try {
        const corpusInfo = await fetchCorpusDetail(corpusId);
        const searchPath = `/search?source=${corpusInfo.source_lang}&target=${corpusInfo.target_lang}`;
        navigate(searchPath);
      } catch (err) {
        navigate('/search');
      }
    } else {
      navigate('/search');
    }
  };

  const handleError = async (error: string) => {
    // Try to use from state first, otherwise get corpus info and build search URL
    const fromPath = (location.state as any)?.from;
    if (fromPath) {
      navigate(fromPath, { state: { error } });
    } else if (corpusId) {
      try {
        const corpusInfo = await fetchCorpusDetail(corpusId);
        const searchPath = `/search?source=${corpusInfo.source_lang}&target=${corpusInfo.target_lang}`;
        navigate(searchPath, { state: { error } });
      } catch (err) {
        navigate('/search', { state: { error } });
      }
    } else {
      navigate('/search', { state: { error } });
    }
  };

  return <SamplePreview corpusId={corpusId} onBack={handleBack} onError={handleError} />;
}
