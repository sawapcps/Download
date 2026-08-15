// src/components/Header.tsx
import { Sun, Moon, Globe, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const { settings, darkMode, language, toggleDarkMode, toggleLanguage, t } = useSettings()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Don't show header on admin pages
  if (location.pathname.startsWith('/login') || location.pathname.startsWith('/admin')) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 glass bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.site_name}
                className="h-10 w-auto"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">X</span>
              </div>
            )}
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              {language === 'ar' ? settings?.site_name_ar : settings?.site_name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {t('home', 'الرئيسية', 'Home')}
            </Link>
            <Link
              to="/articles"
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {t('articles', 'المقالات', 'Articles')}
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="w-5 h-5" />
              <span className="sr-only">{language === 'ar' ? 'EN' : 'ع'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {t('home', 'الرئيسية', 'Home')}
              </Link>
              <Link
                to="/articles"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {t('articles', 'المقالات', 'Articles')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}