// src/pages/admin/AdsPage.tsx
// نسخة تستخدم localStorage بدلاً من قاعدة البيانات

import { useState, useEffect } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { Plus, Edit, Trash2, X, Save, AlertCircle, Image, Check } from 'lucide-react'

interface Ad {
  id: string
  title: string
  title_ar: string | null
  description: string | null
  description_ar: string | null
  image_url: string | null
  link_url: string
  button_text: string
  button_text_ar: string
  button_color: string
  sort_order: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  open_in_new_tab: boolean
  ad_type: 'banner' | 'popup' | 'floating' | 'inline'
  placement_slot: string
  created_at: string
}

const PLACEMENTS = [
  { id: 'before_analyze', name: 'قبل التحليل', nameEn: 'Before Analyze' },
  { id: 'after_results', name: 'بعد النتائج', nameEn: 'After Results' },
  { id: 'homepage_top', name: 'أعلى الرئيسية', nameEn: 'Homepage Top' },
  { id: 'homepage_middle', name: 'وسط الرئيسية', nameEn: 'Homepage Middle' },
  { id: 'after_download', name: 'بعد التحميل', nameEn: 'After Download' },
]

const AD_TYPES = [
  { id: 'banner', name: 'بانر', nameEn: 'Banner' },
  { id: 'popup', name: 'منبثق', nameEn: 'Popup' },
  { id: 'floating', name: 'عائم', nameEn: 'Floating' },
  { id: 'inline', name: 'داخلي', nameEn: 'Inline' },
]

const STORAGE_KEY = 'local_ads'

export function AdsPage() {
  const { language } = useSettings()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    image_url: '',
    link_url: '',
    button_text: 'اعرف المزيد',
    button_text_ar: 'اعرف المزيد',
    button_color: '#3b82f6',
    sort_order: 0,
    start_date: '',
    end_date: '',
    is_active: true,
    open_in_new_tab: true,
    ad_type: 'banner' as const,
    placement_slot: 'before_analyze',
  })

  useEffect(() => {
    loadAds()
  }, [])

  // ✅ تحميل الإعلانات من localStorage
  const loadAds = async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        setAds(Array.isArray(data) ? data : [])
      } else {
        setAds([])
      }
    } catch (error) {
      console.error('Error loading ads:', error)
      setAds([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ حفظ الإعلانات في localStorage
  const saveToStorage = (data: Ad[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  // ✅ حفظ الإعلان (إضافة أو تعديل)
  const handleSave = async () => {
    if (!formData.title_ar || !formData.link_url) {
      setMessage({ type: 'error', text: language === 'ar' ? 'الرجاء ملء الحقول المطلوبة' : 'Please fill required fields' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const newAd: Ad = {
        id: editingId || Date.now().toString(),
        title: formData.title,
        title_ar: formData.title_ar,
        description: formData.description || null,
        description_ar: formData.description_ar || null,
        image_url: formData.image_url || null,
        link_url: formData.link_url,
        button_text: formData.button_text,
        button_text_ar: formData.button_text_ar,
        button_color: formData.button_color,
        sort_order: formData.sort_order,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
        open_in_new_tab: formData.open_in_new_tab,
        ad_type: formData.ad_type,
        placement_slot: formData.placement_slot,
        created_at: new Date().toISOString(),
      }

      let updatedAds: Ad[] = []
      
      if (editingId) {
        // تعديل
        updatedAds = ads.map(ad => ad.id === editingId ? newAd : ad)
      } else {
        // إضافة جديدة
        updatedAds = [newAd, ...ads]
      }

      saveToStorage(updatedAds)
      setAds(updatedAds)
      
      setMessage({ type: 'success', text: language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully' })
      setShowModal(false)
      setEditingId(null)
      resetForm()
      
      // ✅ إعادة تحميل الإعلانات
      await loadAds()
    } catch (error) {
      console.error('Error saving ad:', error)
      setMessage({ type: 'error', text: language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving' })
    } finally {
      setSaving(false)
    }
  }

  // ✅ حذف الإعلان
  const handleDelete = async (id: string) => {
    try {
      const updatedAds = ads.filter(ad => ad.id !== id)
      saveToStorage(updatedAds)
      setAds(updatedAds)
      setMessage({ type: 'success', text: language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully' })
    } catch (error) {
      console.error('Error deleting ad:', error)
      setMessage({ type: 'error', text: language === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Error deleting' })
    } finally {
      setDeleteId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      image_url: '',
      link_url: '',
      button_text: 'اعرف المزيد',
      button_text_ar: 'اعرف المزيد',
      button_color: '#3b82f6',
      sort_order: 0,
      start_date: '',
      end_date: '',
      is_active: true,
      open_in_new_tab: true,
      ad_type: 'banner',
      placement_slot: 'before_analyze',
    })
  }

  const openEditModal = (ad: Ad) => {
    setEditingId(ad.id)
    setFormData({
      title: ad.title,
      title_ar: ad.title_ar || '',
      description: ad.description || '',
      description_ar: ad.description_ar || '',
      image_url: ad.image_url || '',
      link_url: ad.link_url,
      button_text: ad.button_text,
      button_text_ar: ad.button_text_ar,
      button_color: ad.button_color,
      sort_order: ad.sort_order,
      start_date: ad.start_date || '',
      end_date: ad.end_date || '',
      is_active: ad.is_active,
      open_in_new_tab: ad.open_in_new_tab,
      ad_type: ad.ad_type as any,
      placement_slot: ad.placement_slot,
    })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'الإعلانات' : 'Ads'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'ar' ? 'إدارة الإعلانات' : 'Manage ads'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingId(null); setShowModal(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {language === 'ar' ? 'إضافة إعلان' : 'Add Ad'}
        </button>
      </div>

      {/* رسائل الحالة */}
      {message && (
        <div className={`mb-6 flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* عرض الإعلانات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ads.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <div className="text-6xl mb-4">📢</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {language === 'ar' ? 'لا توجد إعلانات' : 'No ads found'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {language === 'ar' ? 'اضغط على "إضافة إعلان" لإنشاء أول إعلان' : 'Click "Add Ad" to create your first ad'}
            </p>
          </div>
        ) : (
          ads.map((ad) => (
            <div key={ad.id} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="flex gap-4">
                {ad.image_url ? (
                  <img src={ad.image_url} alt={ad.title} className="w-24 h-24 object-cover rounded-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">
                    {language === 'ar' && ad.title_ar ? ad.title_ar : ad.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {PLACEMENTS.find(p => p.id === ad.placement_slot)?.[language === 'ar' ? 'name' : 'nameEn'] || ad.placement_slot}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      ad.is_active 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {ad.is_active 
                        ? (language === 'ar' ? 'نشط' : 'Active')
                        : (language === 'ar' ? 'غير نشط' : 'Inactive')
                      }
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {AD_TYPES.find(t => t.id === ad.ad_type)?.[language === 'ar' ? 'name' : 'nameEn'] || ad.ad_type}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => openEditModal(ad)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => setDeleteId(ad.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal - نافذة الإضافة/التعديل */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId 
                  ? (language === 'ar' ? 'تعديل الإعلان' : 'Edit Ad')
                  : (language === 'ar' ? 'إضافة إعلان' : 'Add Ad')}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); resetForm() }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    العنوان (عربي) *
                  </label>
                  <input
                    type="text"
                    value={formData.title_ar}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    className="input-primary"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    العنوان (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    الوصف (عربي)
                  </label>
                  <textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    className="input-primary"
                    rows={2}
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    الوصف (إنجليزي)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-primary"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="input-primary"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رابط الإعلان *
                </label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="input-primary"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    نوع الإعلان
                  </label>
                  <select
                    value={formData.ad_type}
                    onChange={(e) => setFormData({ ...formData, ad_type: e.target.value as any })}
                    className="input-primary"
                  >
                    {AD_TYPES.map(t => (
                      <option key={t.id} value={t.id}>
                        {language === 'ar' ? t.name : t.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    مكان الإعلان
                  </label>
                  <select
                    value={formData.placement_slot}
                    onChange={(e) => setFormData({ ...formData, placement_slot: e.target.value })}
                    className="input-primary"
                  >
                    {PLACEMENTS.map(p => (
                      <option key={p.id} value={p.id}>
                        {language === 'ar' ? p.name : p.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    نص الزر (عربي)
                  </label>
                  <input
                    type="text"
                    value={formData.button_text_ar}
                    onChange={(e) => setFormData({ ...formData, button_text_ar: e.target.value })}
                    className="input-primary"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    نص الزر (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="input-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    لون الزر
                  </label>
                  <input
                    type="color"
                    value={formData.button_color}
                    onChange={(e) => setFormData({ ...formData, button_color: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    تاريخ البداية
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="input-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    تاريخ النهاية
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="input-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'نشط' : 'Active'}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.open_in_new_tab}
                    onChange={(e) => setFormData({ ...formData, open_in_new_tab: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'فتح في صفحة جديدة' : 'Open in new tab'}
                  </span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); setEditingId(null); resetForm() }}
                className="btn-secondary"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.title_ar || !formData.link_url}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {language === 'ar' ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* تأكيد الحذف */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">
                {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {language === 'ar'
                ? 'هل أنت متأكد من حذف هذا الإعلان؟'
                : 'Are you sure you want to delete this ad?'}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                {language === 'ar' ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}