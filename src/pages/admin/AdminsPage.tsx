// src/pages/admin/AdminsPage.tsx
// معدل - بدون Supabase

import { useState, useEffect } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { query } from '@/lib/database'
import type { Admin } from '@/types'
import { Plus, Edit, Trash2, X, Save, AlertCircle, Shield, User } from 'lucide-react'

export function AdminsPage() {
  const { language } = useSettings()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // بيانات المشرف الافتراضي
  const DEFAULT_ADMIN = {
    email: 'sawapcps@gmail.com',
    password: 'admin123456',
    name: 'Admin',
    role: 'super_admin'
  }

  const [formData, setFormData] = useState({
    email: DEFAULT_ADMIN.email,
    password: DEFAULT_ADMIN.password,
    name: DEFAULT_ADMIN.name,
    role: DEFAULT_ADMIN.role,
    is_active: true,
  })

  useEffect(() => {
    loadAdmins()
    // إضافة المشرف الافتراضي إذا لم يكن موجوداً
    ensureDefaultAdmin()
  }, [])

  const ensureDefaultAdmin = async () => {
    try {
      // تحقق إذا كان المشرف الافتراضي موجود
      const existing = await query(
        'SELECT id FROM admins WHERE email = ?',
        [DEFAULT_ADMIN.email]
      ) as any[]

      if (!existing || existing.length === 0) {
        // إذا لم يكن موجوداً، أضفه
        const passwordHash = await hashPassword(DEFAULT_ADMIN.password)
        await query(
          'INSERT INTO admins (email, password_hash, name, role, is_active, created_at) VALUES (?, ?, ?, ?, 1, NOW())',
          [DEFAULT_ADMIN.email, passwordHash, DEFAULT_ADMIN.name, DEFAULT_ADMIN.role]
        )
        console.log('✅ تم إضافة المشرف الافتراضي بنجاح')
        loadAdmins() // إعادة تحميل القائمة
      }
    } catch (error) {
      console.error('Error ensuring default admin:', error)
    }
  }

  const loadAdmins = async () => {
    try {
      const data = await query(
        'SELECT id, email, name, role, is_active, last_login, created_at FROM admins ORDER BY created_at DESC'
      ) as Admin[]
      
      if (data && Array.isArray(data)) {
        setAdmins(data)
      }
    } catch (error) {
      console.error('Error loading admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleSave = async () => {
    if (!formData.email || (!editingAdmin && !formData.password)) return

    setSaving(true)

    try {
      const passwordHash = formData.password
        ? await hashPassword(formData.password)
        : undefined

      if (editingAdmin) {
        const updates: Record<string, any> = {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          is_active: formData.is_active ? 1 : 0,
        }
        if (passwordHash) updates.password_hash = passwordHash

        await query(
          `UPDATE admins SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')} WHERE id = ?`,
          [...Object.values(updates), editingAdmin.id]
        )
      } else {
        await query(
          'INSERT INTO admins (email, password_hash, name, role, is_active, created_at) VALUES (?, ?, ?, ?, 1, NOW())',
          [formData.email, passwordHash!, formData.name || formData.email.split('@')[0], formData.role]
        )
      }

      setShowModal(false)
      setEditingAdmin(null)
      setFormData({ email: '', password: '', name: '', role: 'admin', is_active: true })
      loadAdmins()
    } catch (error) {
      console.error('Error saving admin:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await query('DELETE FROM admins WHERE id = ?', [id])
      loadAdmins()
    } catch (error) {
      console.error('Error deleting admin:', error)
    } finally {
      setDeleteConfirm(null)
    }
  }

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin)
    setFormData({
      email: admin.email,
      password: '',
      name: admin.name || '',
      role: admin.role,
      is_active: admin.is_active,
    })
    setShowModal(true)
  }

  const openAddModal = () => {
    setEditingAdmin(null)
    setFormData({ 
      email: '', 
      password: '', 
      name: '', 
      role: 'admin', 
      is_active: true 
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
            {language === 'ar' ? 'المشرفون' : 'Admins Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'ar' ? 'إدارة حسابات المشرفين والصلاحيات' : 'Manage admin accounts and permissions'}
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {language === 'ar' ? 'إضافة مشرف' : 'Add Admin'}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'المشرف' : 'Admin'}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'الدور' : 'Role'}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'آخر دخول' : 'Last Login'}
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {admin.name || admin.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                      admin.role === 'super_admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {admin.role === 'super_admin' && <Shield className="w-4 h-4" />}
                      {admin.role === 'super_admin'
                        ? language === 'ar' ? 'مدير عام' : 'Super Admin'
                        : language === 'ar' ? 'مدير' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        admin.is_active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {admin.is_active
                        ? language === 'ar' ? 'نشط' : 'Active'
                        : language === 'ar' ? 'معطل' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {admin.last_login
                      ? new Date(admin.last_login).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')
                      : language === 'ar' ? 'لم يسجل دخول' : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(admin.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة إضافة/تعديل مشرف */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingAdmin
                  ? language === 'ar' ? 'تعديل المشرف' : 'Edit Admin'
                  : language === 'ar' ? 'إضافة مشرف' : 'Add Admin'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-primary"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الاسم' : 'Name'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-primary"
                  placeholder={language === 'ar' ? 'اسم المشرف' : 'Admin name'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  {!editingAdmin && ' *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-primary"
                  placeholder={editingAdmin ? '•••••••• (اتركه فارغ للإبقاء على القديم)' : 'كلمة المرور'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'ar' ? 'الدور' : 'Role'}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-primary"
                >
                  <option value="admin">{language === 'ar' ? 'مدير' : 'Admin'}</option>
                  <option value="super_admin">{language === 'ar' ? 'مدير عام' : 'Super Admin'}</option>
                </select>
              </div>

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
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.email || (!editingAdmin && !formData.password)}
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
      {deleteConfirm && (
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
                ? 'هل أنت متأكد من حذف هذا المشرف؟'
                : 'Are you sure you want to delete this admin?'}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
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