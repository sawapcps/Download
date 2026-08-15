// src/context/SettingsContext.tsx
// تم التعديل للعمل مع قاعدة البيانات عبر الـ API

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { queryOne, getSiteSettings, updateSiteSettings } from '@/lib/database'
import type { SiteSettings } from '@/types'

interface SettingsContextType {
  settings: SiteSettings | null
  loading: boolean
  darkMode: boolean
  language: 'ar' | 'en'
  toggleDarkMode: () => void
  toggleLanguage: () => void
  setLanguage: (lang: 'ar' | 'en') => void
  t: (key: string, arText: string, enText?: string) => string
  refreshSettings: () => Promise<void>
  updateSettings: (data: Partial<SiteSettings>) => Promise<boolean>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')

  // ============================================
  // 🔄 تحديث الإعدادات من قاعدة البيانات
  // ============================================
  const refreshSettings = async () => {
    try {
      console.log('📡 Loading site settings...')
      const data = await getSiteSettings()
      
      if (data) {
        console.log('✅ Settings loaded:', data)
        setSettings(data)
        setLanguage(data.default_language || 'ar')
        setDarkMode(data.dark_mode_default ?? true)
      } else {
        console.log('⚠️ No settings found, using defaults')
        // استخدام إعدادات افتراضية إذا لم توجد
        const defaultSettings: SiteSettings = {
          id: 'default',
          site_name: 'App X Download',
          site_name_ar: 'تحميل تطبيق X',
          logo_url: null,
          favicon_url: null,
          primary_color: '#3b82f6',
          secondary_color: '#1e40af',
          accent_color: '#f59e0b',
          dark_mode_default: true,
          default_language: 'ar',
          meta_title: 'App X Download - تحميل الفيديوهات',
          meta_description: 'أداة مجانية لتحميل الفيديوهات والصوتيات من جميع المنصات',
          meta_keywords: 'تحميل, فيديو, يوتيوب, تيك توك, انستقرام',
          google_analytics_id: null,
          custom_header_code: null,
          custom_footer_code: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setSettings(defaultSettings)
        setLanguage('ar')
        setDarkMode(true)
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // 💾 تحديث الإعدادات
  // ============================================
  const updateSettings = async (data: Partial<SiteSettings>): Promise<boolean> => {
    try {
      console.log('📡 Updating settings:', data)
      const result = await updateSiteSettings(data)
      
      if (result) {
        console.log('✅ Settings updated successfully')
        await refreshSettings() // إعادة تحميل الإعدادات
        return true
      }
      return false
    } catch (error) {
      console.error('❌ Error updating settings:', error)
      return false
    }
  }

  // ============================================
  // 🔄 تحميل الإعدادات عند بدء التطبيق
  // ============================================
  useEffect(() => {
    refreshSettings()
  }, [])

  // ============================================
  // 🌙 تطبيق الوضع الليلي
  // ============================================
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // ============================================
  // 🌐 تطبيق اللغة والاتجاه
  // ============================================
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  // ============================================
  // 🔄 دوال التبديل
  // ============================================
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar')
  }

  // ============================================
  // 🌍 دالة الترجمة
  // ============================================
  const t = (_key: string, arText: string, enText?: string): string => {
    return language === 'ar' ? arText : (enText || arText)
  }

  // ============================================
  // 📤 تصدير السياق
  // ============================================
  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      darkMode,
      language,
      toggleDarkMode,
      toggleLanguage,
      setLanguage,
      t,
      refreshSettings,
      updateSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

// ============================================
// 🎣 Hook مخصص للاستخدام
// ============================================
export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}