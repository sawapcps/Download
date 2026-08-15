// src/pages/admin/SettingsPage.tsx
// مع تصحيح التصدير

import { useState, useEffect } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { query, queryOne } from '@/lib/database'
import type { SiteSettings } from '@/types'
import { Save, Check, AlertCircle } from 'lucide-react'

export function SettingsPage() {
  const { refreshSettings } = useSettings()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await queryOne('SELECT * FROM site_settings LIMIT 1')
      
      if (data) {
        setSettings(data as SiteSettings)
      }
    } catch (err) {
      setError('Error loading settings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      await query(
        `UPDATE site_settings 
         SET site_name = ?, site_name_ar = ?, logo_url = ?, favicon_url = ?,
             primary_color = ?, secondary_color = ?, accent_color = ?,
             dark_mode_default = ?, default_language = ?,
             meta_title = ?, meta_description = ?, meta_keywords = ?,
             google_analytics_id = ?, custom_header_code = ?, custom_footer_code = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [
          settings.site_name,
          settings.site_name_ar,
          settings.logo_url || null,
          settings.favicon_url || null,
          settings.primary_color,
          settings.secondary_color,
          settings.accent_color,
          settings.dark_mode_default ? 1 : 0,
          settings.default_language,
          settings.meta_title || null,
          settings.meta_description || null,
          settings.meta_keywords || null,
          settings.google_analytics_id || null,
          settings.custom_header_code || null,
          settings.custom_footer_code || null,
          settings.id
        ]
      )

      setSuccess(true)
      refreshSettings()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Error saving settings')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof SiteSettings, value: string | boolean) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          إعدادات الموقع
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          حفظ الإعدادات
        </button>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
          <Check className="w-5 h-5" />
          تم حفظ الإعدادات بنجاح
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            معلومات الموقع
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                اسم الموقع (إنجليزي)
              </label>
              <input
                type="text"
                value={settings?.site_name || ''}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="input-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                اسم الموقع (عربي)
              </label>
              <input
                type="text"
                value={settings?.site_name_ar || ''}
                onChange={(e) => handleChange('site_name_ar', e.target.value)}
                className="input-primary"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                رابط الشعار (Logo URL)
              </label>
              <input
                type="url"
                value={settings?.logo_url || ''}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                className="input-primary"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                رابط الأيقونة (Favicon URL)
              </label>
              <input
                type="url"
                value={settings?.favicon_url || ''}
                onChange={(e) => handleChange('favicon_url', e.target.value)}
                className="input-primary"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            الألوان
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                اللون الأساسي
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings?.primary_color || '#3b82f6'}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={settings?.primary_color || ''}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="input-primary flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                اللون الثانوي
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings?.secondary_color || '#1e40af'}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={settings?.secondary_color || ''}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                  className="input-primary flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                اللون المميز
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings?.accent_color || '#f59e0b'}
                  onChange={(e) => handleChange('accent_color', e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={settings?.accent_color || ''}
                  onChange={(e) => handleChange('accent_color', e.target.value)}
                  className="input-primary flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            التفضيلات
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  الوضع الليلي افتراضي
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  تفعيل الوضع الليلي تلقائياً
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.dark_mode_default || false}
                  onChange={(e) => handleChange('dark_mode_default', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                اللغة الافتراضية
              </label>
              <select
                value={settings?.default_language || 'ar'}
                onChange={(e) => handleChange('default_language', e.target.value)}
                className="input-primary"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            تحسينات محركات البحث (SEO)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                عنوان Meta
              </label>
              <input
                type="text"
                value={settings?.meta_title || ''}
                onChange={(e) => handleChange('meta_title', e.target.value)}
                className="input-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                وصف Meta
              </label>
              <textarea
                value={settings?.meta_description || ''}
                onChange={(e) => handleChange('meta_description', e.target.value)}
                rows={3}
                className="input-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الكلمات المفتاحية
              </label>
              <input
                type="text"
                value={settings?.meta_keywords || ''}
                onChange={(e) => handleChange('meta_keywords', e.target.value)}
                className="input-primary"
                placeholder="كلمة1, كلمة2, كلمة3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Google Analytics ID
              </label>
              <input
                type="text"
                value={settings?.google_analytics_id || ''}
                onChange={(e) => handleChange('google_analytics_id', e.target.value)}
                className="input-primary"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Custom Code */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            أكود مخصصة
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                كود الهيدر (Custom Header Code)
              </label>
              <textarea
                value={settings?.custom_header_code || ''}
                onChange={(e) => handleChange('custom_header_code', e.target.value)}
                rows={4}
                className="input-primary font-mono text-sm"
                placeholder={'<script>\n  // Your custom code\n</script>'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                كود الفوتر (Custom Footer Code)
              </label>
              <textarea
                value={settings?.custom_footer_code || ''}
                onChange={(e) => handleChange('custom_footer_code', e.target.value)}
                rows={4}
                className="input-primary font-mono text-sm"
                placeholder={'<script>\n  // Your custom code\n</script>'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}