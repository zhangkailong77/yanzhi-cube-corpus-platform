/**
 * Main Layout Component
 * Provides consistent page structure with navbar and footer
 */
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children || <Outlet />}
      </main>
      {/* Simple Footer to close off page visually */}
      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 mt-auto bg-white">
        <p>&copy; {new Date().getFullYear()} 颜值立方 Yanzhi Cube. All rights reserved.</p>
      </footer>
    </div>
  );
}
