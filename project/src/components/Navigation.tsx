import { useState } from 'react';
import { Package, Users, LogOut, Menu, X } from 'lucide-react';

interface NavigationProps {
  userRole?: 'customer' | 'driver' | 'admin' | null;
  onLogout?: () => void;
}

export function Navigation({ userRole, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout?.();
    setMobileMenuOpen(false);
  };

  if (!userRole) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8" />
            <h1 className="text-2xl font-bold">توصيل الأفراح</h1>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>

          <div className={`
            ${mobileMenuOpen ? 'flex' : 'hidden'} md:flex
            absolute md:relative top-16 md:top-0 left-0 md:left-auto right-0 md:right-auto
            flex-col md:flex-row gap-4 md:gap-6 bg-blue-700 md:bg-transparent
            w-full md:w-auto p-4 md:p-0
          `}>
            {userRole === 'customer' && (
              <a href="#home" className="hover:text-blue-200 transition">
                الطلبات
              </a>
            )}
            {userRole === 'driver' && (
              <a href="#orders" className="hover:text-blue-200 transition flex items-center gap-2">
                <Users className="w-4 h-4" />
                الطلبات المتاحة
              </a>
            )}
            {userRole === 'admin' && (
              <>
                <a href="#dashboard" className="hover:text-blue-200 transition">
                  لوحة التحكم
                </a>
                <a href="#settings" className="hover:text-blue-200 transition">
                  الإعدادات
                </a>
              </>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
