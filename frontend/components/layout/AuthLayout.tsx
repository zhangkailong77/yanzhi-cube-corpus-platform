/**
 * Auth Layout Component
 * Clean, focused layout for authentication pages (login, register)
 */
import { Outlet } from 'react-router-dom';
import Logo from '@/components/ui/Logo';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="mx-auto h-12 w-auto" />
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>
        <p className="text-center text-slate-600 text-sm mt-6">
          &copy; 2024 Yanzhi Cube. All rights reserved.
        </p>
      </div>
    </div>
  );
}
