/**
 * Sample Preview Page Component
 * Wraps SamplePreview component with router parameter extraction
 */
import { useParams, useNavigate } from 'react-router-dom';
import SamplePreview from '@/components/SamplePreview';

export default function SamplePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const corpusId = id ? parseInt(id) : null;

  const handleBack = () => {
    navigate(-1);
  };

  const handleError = (error: string) => {
    navigate(-1, { state: { error } });
  };

  return <SamplePreview corpusId={corpusId} onBack={handleBack} onError={handleError} />;
}
