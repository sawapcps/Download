// src/pages/admin/CategoriesPage.tsx
// نسخة آمنة - مع التحقق من المصفوفات

import { useState, useEffect } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { query } from '@/lib/database'
import { Plus, Edit, Trash2, X, Save, AlertCircle, FolderTree } from 'lucide-react'

interface Category {
  id: string
  slug: string
  name: string
  name_ar: string | null
  description: string | null
  description_ar: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

export function CategoriesPage() {
  const { language } = useSettings()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    icon: '',
    sort_order: 0,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await query('SELECT * FROM categories ORDER BY sort_order ASC')
      // ✅ التأكد من أن البيانات مصفوفة
      if (Array.isArray(data)) {
        setCategories(data)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.slug || !formData.name_ar) {
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
          `UPDATE categories SET ${updates} WHERE id = ?`,
          [...values, editingId]
        )
      } else {
        const placeholders = fields.map(() => '?').join(', ')
        await query(
          `INSERT INTO categories (${fields.join(', ')}, created_at) VALUES (${placeholders}, NOW())`,
          values
        )
      }

      setShowModal(false)
      setEditingId(null)
      resetForm()
      loadCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      alert(language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await query('DELETE FROM categories WHERE id = ?', [id])
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      slug: '',
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      icon: '',
      sort_order: 0,
    })
  }

  const openEditModal = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      slug: category.slug,
      name: category.name,
      name_ar: category.name_ar || '',
      description: category.description || '',
      description_ar: category.description_ar || '',
      icon: category.icon || '',
      sort_order: category.sort_order,
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

  // ✅ التأكد من أن categories مصفوفة قبل استخدام map
  const categoriesList = Array.isArray(categories) ? categories : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? 'التصنيفات' : 'Categories'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'ar' ? 'إدارة تصنيفات المقالات' : 'Manage article categories'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingId(null); setShowModal(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {language === 'ar' ? 'إضافة تصنيف' : 'Add Category'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesList.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <div className="text-6xl mb-4">🏷️</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {language === 'ar' ? 'لا توجد تصنيفات' : 'No categories found'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {language === 'ar' ? 'اضغط على "إضافة تصنيف" لإنشاء أول تصنيف' : 'Click "Add Category" to create your first category'}
            </p>
          </div>
        ) : (
          categoriesList.map((category) => (
            <div key={category.id} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {language === 'ar' && category.name_ar ? category.name_ar : category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    /{category.slug}
                  </p>
                  {category.icon && (
                    <div className="mt-1 text-2xl">{category.icon}</div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => setDeleteId(category.id)}
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId 
                  ? (language === 'ar' ? 'تعديل التصنيف' : 'Edit Category')
                  : (language === 'ar' ? 'إضافة تصنيف' : 'Add Category')}
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
                  placeholder="technology"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'الاسم (عربي) *' : 'Name (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="input-primary"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  {language === 'ar' ? 'الأيقونة (Emoji)' : 'Icon (Emoji)'}
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="input-primary"
                  placeholder="📱"
                />
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
                disabled={saving || !formData.slug || !formData.name_ar}
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
                ? 'هل أنت متأكد من حذف هذا التصنيف؟'
                : 'Are you sure you want to delete this category?'}
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