// src/pages/admin/AdminLayout.tsx
// القائمة الجانبية ظاهرة دائماً

import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAdmin } from '@/context/AdminContext'
import { useSettings } from '@/context/SettingsContext'
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  Users,
  Megaphone,
  Link2,
  FileText,
  Newspaper,
  FolderTree,
  BarChart3,
  History,
  LogOut,
  ChevronLeft,
  Sun,
  Moon,
} from 'lucide-react'

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: { ar: 'لوحة التحكم', en: 'Dashboard' }, exact: true },
  { path: '/admin/settings', icon: SettingsIcon, label: { ar: 'إعدادات الموقع', en: 'Site Settings' } },
  { path: '/admin/admins', icon: Users, label: { ar: 'المديرون', en: 'Admins' } },
  { path: '/admin/ads', icon: Megaphone, label: { ar: 'الإعلانات', en: 'Ads' } },
  { path: '/admin/links', icon: Link2, label: { ar: 'روابطي', en: 'My Links' } },
  { path: '/admin/pages', icon: FileText, label: { ar: 'الصفحات', en: 'Pages' } },
  { path: '/admin/articles', icon: Newspaper, label: { ar: 'المقالات', en: 'Articles' } },
  { path: '/admin/categories', icon: FolderTree, label: { ar: 'التصنيفات', en: 'Categories' } },
  { path: '/admin/analytics', icon: BarChart3, label: { ar: 'الإحصائيات', en: 'Analytics' } },
  { path: '/admin/activity', icon: History, label: { ar: 'سجل النشاط', en: 'Activity Log' } },
]

export function AdminLayout() {
  const { admin, logout, isAuthenticated } = useAdmin()
  const { language, darkMode, toggleDarkMode } = useSettings()
  const location = useLocation()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    navigate('/admin/login')
    return null
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* ============================================
          القائمة الجانبية - ظاهرة دائماً
          ============================================ */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex-shrink-0 min-h-screen">
        <div className="flex flex-col h-full">
          {/* الشعار */}
          <div className="p-4 border-b dark:border-gray-700">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
                </span>
              </div>
            </Link>
          </div>

          {/* القائمة */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path, item.exact)
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">
                      {language === 'ar' ? item.label.ar : item.label.en}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* أسفل القائمة */}
          <div className="p-4 border-t dark:border-gray-700 space-y-3">
            {/* تبديل الوضع */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="font-medium">
                {darkMode
                  ? language === 'ar' ? 'الوضع الفاتح' : 'Light Mode'
                  : language === 'ar' ? 'الوضع الليلي' : 'Dark Mode'}
              </span>
            </button>

            {/* العودة للموقع */}
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
              <span className="font-medium">
                {language === 'ar' ? 'العودة للموقع' : 'Back to Site'}
              </span>
            </Link>

            {/* تسجيل الخروج */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">
                {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================
          المحتوى الرئيسي
          ============================================ */}
      <div className="flex-1">
        {/* الشريط العلوي */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {admin?.name || admin?.email}
              </span>
            </div>
          </div>
        </header>

        {/* محتوى الصفحة */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}