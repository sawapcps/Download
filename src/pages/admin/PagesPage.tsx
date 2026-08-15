// src/pages/admin/PagesPage.tsx
// صفحة إدارة الصفحات - نسخة آمنة

import { useState, useEffect } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { query } from '@/lib/database'
import { Plus, Edit, Trash2, X, Save, AlertCircle } from 'lucide-react'
interface Page {
  id: string
  slug: string
  title: string
  title_ar: string | null
  content: string | null
  content_ar: string | null
  is_published: boolean
  show_in_menu: boolean
  sort_order: number
  created_at: string
}

export function PagesPage() {
  const { language } = useSettings()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    title_ar: '',
    content: '',
    content_ar: '',
    is_published: true,
    show_in_menu: false,
    sort_order: 0,
  })

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    try {
      const data = await query('SELECT * FROM pages ORDER BY sort_order ASC') as Page[]
      // ✅ التأكد من أن البيانات مصفوفة
      setPages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading pages:', error)
      setPages([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.slug || !formData.title_ar) return

    setSaving(true)
    try {
      const fields = Object.keys(formData).filter(k => formData[k as keyof typeof formData] !== '')
      const values = fields.map(k => formData[k as keyof typeof formData])
      
      if (editingId) {
        const updates = fields.map(k => `${k} = ?`).join(', ')
        await query(
          `UPDATE pages SET ${updates} WHERE id = ?`,
          [...values, editingId]
        )
      } else {
        const placeholders = fields.map(() => '?').join(', ')
        await query(
          `INSERT INTO pages (${fields.join(', ')}, created_at) VALUES (${placeholders}, NOW())`,
          values
        )
      }

      setShowModal(false)
      setEditingId(null)
      resetForm()
      loadPages()
    } catch (error) {
      console.error('Error saving page:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await query('DELETE FROM pages WHERE id = ?', [id])
      loadPages()
    } catch (error) {
      console.error('Error deleting page:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      title_ar: '',
      content: '',
      content_ar: '',
      is_published: true,
      show_in_menu: false,
      sort_order: 0,
    })
  }

  const openEditModal = (page: Page) => {
    setEditingId(page.id)
    setFormData({
      slug: page.slug,
      title: page.title,
      title_ar: page.title_ar || '',
      content: page.content || '',
      content_ar: page.content_ar || '',
      is_published: page.is_published,
      show_in_menu: page.show_in_menu,
      sort_order: page.sort_order,
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
            {language === 'ar' ? 'الصفحات' : 'Pages'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'ar' ? 'إدارة الصفحات الثابتة' : 'Manage static pages'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingId(null); setShowModal(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {language === 'ar' ? 'إضافة صفحة' : 'Add Page'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!pages || pages.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {language === 'ar' ? 'لا توجد صفحات' : 'No pages found'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {language === 'ar' ? 'اضغط على "إضافة صفحة" لإنشاء أول صفحة' : 'Click "Add Page" to create your first page'}
            </p>
          </div>
        ) : (
          pages.map((page) => (
            <div key={page.id} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {language === 'ar' && page.title_ar ? page.title_ar : page.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    /{page.slug}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      page.is_published 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {page.is_published 
                        ? (language === 'ar' ? 'منشور' : 'Published')
                        : (language === 'ar' ? 'مسودة' : 'Draft')
                      }
                    </span>
                    {page.show_in_menu && (
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {language === 'ar' ? 'في القائمة' : 'In Menu'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(page)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => setDeleteId(page.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId 
                  ? (language === 'ar' ? 'تعديل الصفحة' : 'Edit Page')
                  : (language === 'ar' ? 'إضافة صفحة' : 'Add Page')}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); resetForm() }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'ar' ? 'الرابط (Slug) *' : 'Slug *'}
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                  className="input-primary"
                  placeholder="about-us"
                />
              </div>

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
                    {language === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'}
                  </label>
                  <textarea
                    value={formData.content_ar}
                    onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                    className="input-primary"
                    rows={4}
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input-primary"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'منشور' : 'Published'}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.show_in_menu}
                    onChange={(e) => setFormData({ ...formData, show_in_menu: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'ظهور في القائمة' : 'Show in menu'}
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
                disabled={saving || !formData.slug || !formData.title_ar}
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

      {/* Delete Confirmation */}
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
                ? 'هل أنت متأكد من حذف هذه الصفحة؟'
                : 'Are you sure you want to delete this page?'}
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