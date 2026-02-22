/**
 * Home Page Component
 * Main landing page with Hero search interface and statistics overview
 */
import Hero from '@/components/Hero';
import StatsOverview from '@/components/StatsOverview';

export function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <StatsOverview />
    </div>
  );
}
export default HomePage;
