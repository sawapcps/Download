import { useState, useEffect } from 'react';
import { BarChart3, Settings, Users, Package, DollarSign, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
  userId: string;
}

export function AdminDashboard({ userId }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    totalUsers: 0
  });
  const [settings, setSettings] = useState({
    mobile_wallet_number: '',
    admin_commission_percentage: '40',
    driver_commission_percentage: '60'
  });
  const [editingSettings, setEditingSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, usersRes, driversRes] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('users').select('*'),
        supabase.from('drivers').select('*').eq('is_active', true)
      ]);

      const orders = ordersRes.data || [];
      const revenue = orders
        .filter(o => o.payment_status === 'completed')
        .reduce((sum, o) => sum + o.delivery_fee, 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue: revenue,
        activeDrivers: driversRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('app_settings').select('*');
    if (data) {
      const settingsMap: any = {};
      data.forEach(s => {
        settingsMap[s.setting_key] = s.setting_value;
      });
      setSettings({
        mobile_wallet_number: settingsMap.mobile_wallet_number || '',
        admin_commission_percentage: settingsMap.admin_commission_percentage || '40',
        driver_commission_percentage: settingsMap.driver_commission_percentage || '60'
      });
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from('app_settings')
          .upsert({
            setting_key: key,
            setting_value: String(value)
          });
      }
      setEditingSettings(false);
      fetchSettings();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">لوحة التحكم</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-4 font-semibold transition ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            النظرة العامة
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-4 font-semibold transition ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            الإعدادات
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">إجمالي الطلبات</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                  </div>
                  <Package className="w-12 h-12 text-blue-600 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">إجمالي الإيرادات</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {stats.totalRevenue.toFixed(2)} ₪
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-600 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">السائقون النشطون</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{stats.activeDrivers}</p>
                  </div>
                  <Users className="w-12 h-12 text-orange-600 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">إجمالي المستخدمين</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-12 h-12 text-purple-600 opacity-50" />
                </div>
              </div>
            </div>

            {/* Revenue Calculation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl font-bold mb-6">حساب الإيرادات</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {stats.totalRevenue.toFixed(2)} ₪
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">نسبة الإدارة ({settings.admin_commission_percentage}%)</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {(stats.totalRevenue * (Number(settings.admin_commission_percentage) / 100)).toFixed(2)} ₪
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">حصة السائقين ({settings.driver_commission_percentage}%)</p>
                    <p className="text-2xl font-bold text-purple-600 mt-2">
                      {(stats.totalRevenue * (Number(settings.driver_commission_percentage) / 100)).toFixed(2)} ₪
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold mb-6">إعدادات التطبيق</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم محفظة الجوال
                  </label>
                  <input
                    type="text"
                    value={settings.mobile_wallet_number}
                    onChange={(e) => setSettings({
                      ...settings,
                      mobile_wallet_number: e.target.value
                    })}
                    disabled={!editingSettings}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="أدخل رقم محفظة الجوال"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    هذا هو الرقم الذي سيتلقى العملاء التحويل عليه
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نسبة عمولة الإدارة (%)
                    </label>
                    <input
                      type="number"
                      value={settings.admin_commission_percentage}
                      onChange={(e) => setSettings({
                        ...settings,
                        admin_commission_percentage: e.target.value
                      })}
                      disabled={!editingSettings}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نسبة عمولة السائق (%)
                    </label>
                    <input
                      type="number"
                      value={settings.driver_commission_percentage}
                      onChange={(e) => setSettings({
                        ...settings,
                        driver_commission_percentage: e.target.value
                      })}
                      disabled={!editingSettings}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    ملاحظة: تأكد من أن مجموع النسبتين يساوي 100%
                  </p>
                </div>

                <div className="flex gap-4">
                  {!editingSettings ? (
                    <button
                      onClick={() => setEditingSettings(true)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      <Edit2 className="w-4 h-4" />
                      تعديل
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
                      >
                        {loading ? 'جاري الحفظ...' : 'حفظ'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingSettings(false);
                          fetchSettings();
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
                      >
                        إلغاء
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
