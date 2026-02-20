import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import SearchResults from '@/pages/SearchResults';
import SamplePreview from '@/pages/SamplePreview';
import Dashboard from '@/pages/Dashboard';
import Unauthorized from '@/pages/Unauthorized';
import NotFound from '@/pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Home />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/preview/:encodedId" element={<SamplePreview />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
