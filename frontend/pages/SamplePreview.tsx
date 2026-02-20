/**
 * Sample Preview Page Component
 * Wraps SamplePreview component with router parameter extraction
 */
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SamplePreview from '@/components/SamplePreview';

export default function SamplePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const corpusId = id ? parseInt(id) : null;

  const fromPath = (location.state as any)?.from || '/search';

  const handleBack = () => {
    navigate(fromPath);
  };

  const handleError = (error: string) => {
    navigate(fromPath, { state: { error } });
  };

  return <SamplePreview corpusId={corpusId} onBack={handleBack} onError={handleError} />;
}
