import { useSettings } from '@/context/SettingsContext'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

export function Footer() {
  const { settings, language, t } = useSettings()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="" className="h-8 w-auto" />
              ) : (
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">X</span>
                </div>
              )}
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? settings?.site_name_ar : settings?.site_name}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {language === 'ar'
                ? 'أداة مجانية لتحميل الفيديوهات والصوتيات من جميع المنصات'
                : 'Free tool to download videos and audio from all platforms'}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {t('home', 'الرئيسية', 'Home')}
                </Link>
              </li>
              <li>
                <Link
                  to="/articles"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {t('articles', 'المقالات', 'Articles')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'عن الموقع' : 'About'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/page/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {t('privacy', 'سياسة الخصوصية', 'Privacy Policy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/page/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {t('terms', 'شروط الاستخدام', 'Terms of Use')}
                </Link>
              </li>
              <li>
                <Link
                  to="/page/contact"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {t('contact', 'اتصل بنا', 'Contact Us')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {language === 'ar'
                ? `© ${currentYear} جميع الحقوق محفوظة`
                : `© ${currentYear} All rights reserved`}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm flex items-center gap-1">
              {language === 'ar' ? 'صنع بـ' : 'Made with'}
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}