// src/pages/admin/LinksPage.tsx
// نسخة آمنة - مع التحقق من المصفوفات

import { useState, useEffect } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { query } from '@/lib/database'
import { Plus, Edit, Trash2, X, ExternalLink, Save, AlertCircle, Link as LinkIcon } from 'lucide-react'

interface Link {
  id: string
  title: string
  title_ar: string | null
  description: string | null
  description_ar: string | null
  image_url: string | null
  link_url: string
  button_color: string
  sort_order: number
  is_active: boolean
  open_in_new_tab: boolean
  created_at: string
}

const PLACEMENTS = [
  { id: 'homepage', name: 'الصفحة الرئيسية', nameEn: 'Homepage' },
  { id: 'results', name: 'صفحة النتائج', nameEn: 'Results Page' },
  { id: 'footer', name: 'الفوتر', nameEn: 'Footer' },
]

export function LinksPage() {
  const { language } = useSettings()
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    image_url: '',
    link_url: '',
    button_color: '#3b82f6',
    sort_order: 0,
    is_active: true,
    open_in_new_tab: true,
  })

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    try {
      const data = await query('SELECT * FROM links ORDER BY sort_order ASC')
      // ✅ التأكد من أن البيانات مصفوفة
      if (Array.isArray(data)) {
        setLinks(data)
      } else {
        setLinks([])
      }
    } catch (error) {
      console.error('Error loading links:', error)
      setLinks([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title_ar || !formData.link_url) {
      alert(language === 'ar' ? 'الرجاء ملء الحقول المطلوبة' : 'Please fill required fields')
      return
    }

    setSaving(true)
    try {
      const fields = Object.keys(formData).filter(k => formData[k as keyof typeof formData] !== '')
      const values = fields.map(k => formData[k as keyof typeof formData])
      
      if (editingId) {
        const updates = fields.map(k => `${k} = ?`).join(', ')
        await query(
          `UPDATE links SET ${updates} WHERE id = ?`,
          [...values, editingId]
        )
      } else {
        const placeholders = fields.map(() => '?').join(', ')
        await query(
          `INSERT INTO links (${fields.join(', ')}, created_at) VALUES (${placeholders}, NOW())`,
          values
        )
      }

      setShowModal(false)
      setEditingId(null)
      resetForm()
      loadLinks()
    } catch (error) {
      console.error('Error saving link:', error)
      alert(language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await query('DELETE FROM links WHERE id = ?', [id])
      loadLinks()
    } catch (error) {
      console.error('Error deleting link:', error)
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
      button_color: '#3b82f6',
      sort_order: 0,
      is_active: true,
      open_in_new_tab: true,
    })
    setSelectedPlacements([])
  }

  const openEditModal = (link: Link) => {
    setEditingId(link.id)
    setFormData({
      title: link.title,
      title_ar: link.title_ar || '',
      description: link.description || '',
      description_ar: link.description_ar || '',
      image_url: link.image_url || '',
      link_url: link.link_url,
      button_color: link.button_color,
      sort_order: link.sort_order,
      is_active: link.is_active,
      open_in_new_tab: link.open_in_new_tab,
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

  // ✅ التأكد من أن links مصفوفة قبل استخدام map
  const linksList = Array.isArray(links) ? links : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'روابطي' : 'My Links'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'ar' ? 'إدارة الروابط الخارجية' : 'Manage external links'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingId(null); setShowModal(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {language === 'ar' ? 'إضافة رابط' : 'Add Link'}
        </button>
      </div>

      {/* قائمة الروابط */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {linksList.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {language === 'ar' ? 'لا توجد روابط' : 'No links found'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {language === 'ar' ? 'اضغط على "إضافة رابط" لإنشاء أول رابط' : 'Click "Add Link" to create your first link'}
            </p>
          </div>
        ) : (
          linksList.map((link) => (
            <div key={link.id} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="flex gap-3">
                {link.image_url ? (
                  <img src={link.image_url} alt={link.title} className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <LinkIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">
                    {language === 'ar' && link.title_ar ? link.title_ar : link.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {language === 'ar' && link.description_ar ? link.description_ar : link.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      link.is_active 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {link.is_active 
                        ? (language === 'ar' ? 'نشط' : 'Active')
                        : (language === 'ar' ? 'غير نشط' : 'Inactive')
                      }
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => openEditModal(link)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => setDeleteId(link.id)}
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

      {/* نافذة إضافة/تعديل */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId 
                  ? (language === 'ar' ? 'تعديل الرابط' : 'Edit Link')
                  : (language === 'ar' ? 'إضافة رابط' : 'Add Link')}
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
                    {language === 'ar' ? 'العنوان (عربي) *' : 'Title (Arabic) *'}
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
                    {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
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
                    {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
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
                    {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
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
                  {language === 'ar' ? 'رابط الصورة' : 'Image URL'}
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
                  {language === 'ar' ? 'الرابط *' : 'Link URL *'}
                </label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="input-primary"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'ar' ? 'لون الزر' : 'Button Color'}
                </label>
                <input
                  type="color"
                  value={formData.button_color}
                  onChange={(e) => setFormData({ ...formData, button_color: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'ar' ? 'ترتيب الظهور' : 'Sort Order'}
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="input-primary"
                />
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
                ? 'هل أنت متأكد من حذف هذا الرابط؟'
                : 'Are you sure you want to delete this link?'}
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