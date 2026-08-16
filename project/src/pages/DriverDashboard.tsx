import { useState, useEffect } from 'react';
import { MapPin, Phone, MessageSquare, CheckCircle, Clock, Navigation, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order, Driver } from '../lib/supabase';

interface DriverDashboardProps {
  userId: string;
}

export function DriverDashboard({ userId }: DriverDashboardProps) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDriverInfo();
    getLocation();
  }, []);

  useEffect(() => {
    if (isOnline) {
      const interval = setInterval(() => {
        updateLocation();
        fetchAvailableOrders();
        fetchAcceptedOrders();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isOnline, latitude, longitude]);

  const fetchDriverInfo = async () => {
    const { data } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setDriver(data);
      setLatitude(data.latitude);
      setLongitude(data.longitude);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => console.error('Error getting location:', error)
      );
    }
  };

  const updateLocation = async () => {
    if (latitude && longitude) {
      await supabase
        .from('drivers')
        .update({
          latitude,
          longitude,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    }
  };

  const handleGoOnline = async () => {
    setLoading(true);
    try {
      getLocation();
      await supabase.from('drivers').update({ is_active: true }).eq('id', userId);
      setIsOnline(true);
      fetchAvailableOrders();
    } finally {
      setLoading(false);
    }
  };

  const handleGoOffline = async () => {
    setLoading(true);
    try {
      await supabase.from('drivers').update({ is_active: false }).eq('id', userId);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .eq('city', driver?.city)
      .order('created_at', { ascending: false });

    if (data) setAvailableOrders(data);
  };

  const fetchAcceptedOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('driver_id', userId)
      .in('status', ['accepted', 'in_transit'])
      .order('created_at', { ascending: false });

    if (data) setAcceptedOrders(data);
  };

  const handleAcceptOrder = async (orderId: string) => {
    setLoading(true);
    try {
      await supabase
        .from('orders')
        .update({
          driver_id: userId,
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      fetchAvailableOrders();
      fetchAcceptedOrders();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setLoading(true);
    try {
      await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      fetchAcceptedOrders();
    } finally {
      setLoading(false);
    }
  };

  if (!driver) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{driver.full_name}</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">{driver.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-600">
                  {driver.total_orders} طلب مكتمل
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  driver.tier === 'beginner' ? 'bg-blue-100 text-blue-800' :
                  driver.tier === 'trusted' ? 'bg-green-100 text-green-800' :
                  driver.tier === 'advanced' ? 'bg-purple-100 text-purple-800' :
                  'bg-gold-100 text-gold-800'
                }`}>
                  {driver.tier === 'beginner' && 'سائق مبتدئ'}
                  {driver.tier === 'trusted' && 'سائق موثوق'}
                  {driver.tier === 'advanced' && 'سائق متقدم'}
                  {driver.tier === 'gold' && 'سائق ذهبي'}
                </span>
              </div>
            </div>

            <button
              onClick={isOnline ? handleGoOffline : handleGoOnline}
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-semibold transition ${
                isOnline
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isOnline ? 'انقطع عن الإنترنت' : 'اتصل بالإنترنت'}
            </button>
          </div>
        </div>

        {!isOnline ? (
          <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-8 text-center">
            <Navigation className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-blue-900 mb-2">أنت غير متصل بالإنترنت</h3>
            <p className="text-blue-700">اتصل بالإنترنت للبدء في قبول الطلبات</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Available Orders */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">الطلبات المتاحة ({availableOrders.length})</h3>
              <div className="space-y-4">
                {availableOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">لا توجد طلبات متاحة حالياً</p>
                  </div>
                ) : (
                  availableOrders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-bold">
                          {order.order_type === 'greeting_card' ? 'كرت أفراح' : 'طلبية عامة'}
                        </h4>
                        <span className="text-2xl font-bold text-blue-600">
                          {order.delivery_fee.toFixed(2)} ₪
                        </span>
                      </div>

                      <div className="space-y-2 text-gray-700 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-600" />
                          <span>{order.delivery_address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span>{order.item_description}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                      >
                        قبول الطلب
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Orders */}
            <div>
              <h3 className="text-2xl font-bold mb-4">طلباتي النشطة ({acceptedOrders.length})</h3>
              <div className="space-y-4">
                {acceptedOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="mb-3">
                      <h4 className="font-bold text-gray-900">
                        {order.order_type === 'greeting_card' ? 'كرت أفراح' : 'طلبية'}
                      </h4>
                      <p className="text-sm text-gray-600">{order.delivery_address}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'in_transit')}
                        disabled={loading || order.status === 'in_transit'}
                        className="w-full bg-blue-600 text-white py-2 rounded px-3 text-sm hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
                      >
                        قيد التوصيل
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded px-3 text-sm hover:bg-green-700 transition font-semibold"
                      >
                        مكتمل
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
