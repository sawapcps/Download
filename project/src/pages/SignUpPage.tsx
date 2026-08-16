import { useState } from 'react';
import { Mail, Lock, Phone, User, MapPin, Truck, ArrowLeft } from 'lucide-react';
import { auth } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface SignUpPageProps {
  userType: 'customer' | 'driver';
  onBack: () => void;
  onSuccess: (role: string) => void;
}

export function SignUpPage({ userType, onBack, onSuccess }: SignUpPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cities, setCities] = useState<any[]>([]);

  useState(() => {
    fetchCities();
  });

  const fetchCities = async () => {
    const { data } = await supabase.from('cities').select('*');
    if (data) setCities(data);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (userType === 'customer') {
        await auth.signUpCustomer(email, password, phone, fullName, city);
      } else {
        await auth.signUpDriver(email, password, phone, fullName, city, vehicleInfo);
      }
      onSuccess(userType);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة
        </button>

        <div className="flex items-center gap-3 mb-8">
          {userType === 'customer' ? (
            <User className="w-8 h-8 text-blue-600" />
          ) : (
            <Truck className="w-8 h-8 text-green-600" />
          )}
          <h2 className="text-3xl font-bold">
            {userType === 'customer' ? 'التسجيل كعميل' : 'التسجيل كسائق'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الكامل
            </label>
            <div className="relative">
              <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل اسمك الكامل"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الهاتف
            </label>
            <div className="relative">
              <Phone className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="05912345678"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المدينة
            </label>
            <div className="relative">
              <MapPin className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {userType === 'driver' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بيانات المركبة (اختياري)
              </label>
              <input
                type="text"
                value={vehicleInfo}
                onChange={(e) => setVehicleInfo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="مثال: نيسان - أبيض - رقم لوحة 123"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'جاري التسجيل...' : 'تسجيل'}
          </button>
        </form>
      </div>
    </div>
  );
}
