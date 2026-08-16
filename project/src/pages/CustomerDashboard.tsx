import { useState, useEffect } from 'react';
import { Plus, MapPin, Truck, Clock, CheckCircle, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order, City } from '../lib/supabase';

interface CustomerDashboardProps {
  userId: string;
}

export function CustomerDashboard({ userId }: CustomerDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [formData, setFormData] = useState({
    orderType: 'greeting_card',
    city: '',
    itemDescription: '',
    deliveryAddress: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchCities();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
  };

  const fetchCities = async () => {
    const { data } = await supabase.from('cities').select('*');
    if (data) setCities(data);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const selectedCity = cities.find(c => c.name === formData.city);
      if (!selectedCity) throw new Error('المدينة غير صحيحة');

      const { data } = await supabase.from('orders').insert({
        customer_id: userId,
        order_type: formData.orderType,
        city: formData.city,
        customer_latitude: selectedCity.latitude,
        customer_longitude: selectedCity.longitude,
        delivery_address: formData.deliveryAddress,
        item_description: formData.itemDescription,
        delivery_fee: selectedCity.base_delivery_fee,
        notes: formData.notes
      }).select().single();

      if (data) {
        setOrders([data, ...orders]);
        setShowNewOrder(false);
        setFormData({
          orderType: 'greeting_card',
          city: '',
          itemDescription: '',
          deliveryAddress: '',
          notes: ''
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: Clock,
      accepted: CheckCircle,
      in_transit: Truck,
      completed: CheckCircle
    };
    const Icon = icons[status] || CheckCircle;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900">طلباتي</h2>
            <button
              onClick={() => setShowNewOrder(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <Plus className="w-5 h-5" />
              طلب جديد
            </button>
          </div>
        </div>

        {/* New Order Form */}
        {showNewOrder && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6">إنشاء طلب جديد</h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الطلب
                  </label>
                  <select
                    value={formData.orderType}
                    onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="greeting_card">كرت أفراح</option>
                    <option value="general_delivery">طلبية عامة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدينة
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">اختر مدينة</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وصف الطلبية
                  </label>
                  <input
                    type="text"
                    value={formData.itemDescription}
                    onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: كرت افراح فاخر"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان التوصيل
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: شارع الملك، بجانب المسجد"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات إضافية
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أي معلومات إضافية؟"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {loading ? 'جاري الإنشاء...' : 'إنشاء الطلب'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewOrder(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد طلبيات حتى الآن</p>
              <button
                onClick={() => setShowNewOrder(true)}
                className="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
              >
                إنشاء طلبك الأول
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {order.order_type === 'greeting_card' ? 'كرت أفراح' : 'طلبية عامة'}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status === 'pending' && 'قيد الانتظار'}
                    {order.status === 'accepted' && 'تم قبوله'}
                    {order.status === 'in_transit' && 'قيد التوصيل'}
                    {order.status === 'completed' && 'مكتمل'}
                    {order.status === 'cancelled' && 'ملغى'}
                  </span>
                </div>

                <div className="space-y-2 text-gray-700 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{order.city} - {order.delivery_address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>{order.item_description}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">
                    {order.delivery_fee.toFixed(2)} ₪
                  </span>
                  {order.driver_id && (
                    <button className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition">
                      <Phone className="w-4 h-4" />
                      اتصل بالسائق
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
