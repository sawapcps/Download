import { Package, MapPin, Users, Zap } from 'lucide-react';

interface LandingPageProps {
  onSignUpCustomer: () => void;
  onSignUpDriver: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onSignUpCustomer, onSignUpDriver, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">توصيل الأفراح</h1>
            </div>
            <button
              onClick={onSignIn}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              دخول
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              خدمة التوصيل الموثوقة للضفة الغربية
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              توصيل كروت الأفراح والطلبيات بسرعة وأمان مع تتبع مباشر للسائق من خلال الخريطة
            </p>
            <div className="flex gap-4">
              <button
                onClick={onSignUpCustomer}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
              >
                اطلب الآن (عميل)
              </button>
              <button
                onClick={onSignUpDriver}
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold text-lg"
              >
                انضم كسائق
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-2xl">
              <div className="space-y-6">
                <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
                  <div className="text-sm opacity-75">الطلب الحالي</div>
                  <div className="text-2xl font-bold">جاهز للتوصيل</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
                    <div className="text-xs opacity-75">المسافة</div>
                    <div className="text-lg font-bold">2.5 كم</div>
                  </div>
                  <div className="bg-blue-500 bg-opacity-50 rounded-lg p-4">
                    <div className="text-xs opacity-75">الوقت المتوقع</div>
                    <div className="text-lg font-bold">15 دقيقة</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center mb-16 text-gray-900">
            لماذا توصيل الأفراح؟
          </h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold mb-3">تتبع مباشر</h4>
              <p className="text-gray-600">
                شاهد موقع السائق على الخريطة في الوقت الفعلي
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold mb-3">سائقون موثوقون</h4>
              <p className="text-gray-600">
                سائقون معروفون ومقيمون بدرجات عالية
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold mb-3">توصيل سريع</h4>
              <p className="text-gray-600">
                دفع آمن عبر محفظة جوال بدون خصم
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="text-xl font-bold mb-3">أنواع متعددة</h4>
              <p className="text-gray-600">
                توصيل كروت أفراح وطلبيات متنوعة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-8">نطاق الخدمة</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>مناطق رام الله والبيرة:</strong>
              <p className="mt-2">رام الله، البيرة، بيتونيا، عمّوريتا، كفر عقب</p>
            </div>
            <div>
              <strong>مناطق بيت لحم:</strong>
              <p className="mt-2">بيت لحم، بيت جالا، بيت ساحور، دورا</p>
            </div>
            <div>
              <strong>مناطق أخرى:</strong>
              <p className="mt-2">جنين، نابلس، طولكرم، قلقيلية، سلفيت، الخليل، أريحا وأكثر</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>توصيل الأفراح - خدمة التوصيل الموثوقة في الضفة الغربية</p>
          <p className="mt-2 text-sm">جميع الحقوق محفوظة © 2024</p>
        </div>
      </footer>
    </div>
  );
}
