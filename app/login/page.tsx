'use client';
import Image from "next/image";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types/auth';

// Мобильный анимированный фон
const MobileAnimatedBackground = () => {
  const mobileImages = [
    '/OJS-logo.png',
    '/canvas.png',
    '/platonus.png',
    '/studentclubs-logo.png',
    '/lessons.png',
    '/dormitory-logo.png'
  ];

  const mobileElements = useMemo(() => ({
    images: mobileImages.map((imgSrc, i) => ({
      id: `mobile-img-${i}`,
      src: imgSrc,
      style: {
        width: '60px',
        height: '60px',
        left: `${5 + (i * 15) % 85}%`,
        top: '-80px',
        animationDelay: `${i * 1.5}s`,
        animationDuration: `${6 + Math.random() * 3}s`,
      }
    })),
    shapes: [...Array(6)].map((_, i) => ({
      id: `mobile-shape-${i}`,
      style: {
        width: '80px',
        height: '80px',
        left: `${10 + (i * 15) % 75}%`,
        top: '-100px',
        animationDelay: `${i * 2 + 0.5}s`,
        animationDuration: `${8 + Math.random() * 4}s`,
      }
    })),
    dots: [...Array(12)].map((_, i) => ({
      id: `mobile-dot-${i}`,
      style: {
        width: '35px',
        height: '35px',
        left: `${3 + (i * 8) % 90}%`,
        top: '-50px',
        animationDelay: `${i * 0.8}s`,
        animationDuration: `${4 + Math.random() * 2}s`,
      }
    }))
  }), []);

  return (
    <div className="lg:hidden fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200">
      {/* Слой 1: Падающие PNG изображения */}
      <div className="absolute inset-0">
        {mobileElements.images.map((item) => (
          <div
            key={item.id}
            className="absolute animate-falling-items-mobile flex items-center justify-center"
            style={item.style}
          >
            <Image 
              src={item.src}
              alt=""
              width={50}
              height={50}
              className="object-contain drop-shadow-lg floating-item-mobile"
            />
          </div>
        ))}
      </div>

      {/* Слой 2: Цветные блоки */}
      <div className="absolute inset-0">
        {mobileElements.shapes.map((item) => (
          <div
            key={item.id}
            className="absolute bg-white/70 rounded-xl shadow-lg backdrop-blur-sm border border-indigo-200 animate-falling-items-slow-mobile flex items-center justify-center"
            style={item.style}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Слой 3: Мелкие элементы */}
      <div className="absolute inset-0">
        {mobileElements.dots.map((item) => (
          <div
            key={item.id}
            className="absolute bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-md animate-falling-small-mobile"
            style={item.style}
          ></div>
        ))}
      </div>

      {/* Слой 4: Дополнительные декоративные элементы */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={`deco-${i}`}
            className="absolute animate-falling-small-mobile"
            style={{
              width: '20px',
              height: '20px',
              left: `${10 + (i * 12) % 80}%`,
              top: '-40px',
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              borderRadius: '50%',
              boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)',
            }}
          ></div>
        ))}
      </div>


      {/* Стили анимаций для мобильных */}
      <style jsx global>{`
        @keyframes falling-items-mobile {
          0% { transform: translateY(-100px) rotateZ(0deg); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: translateY(calc(100vh + 100px)) rotateZ(360deg); opacity: 0; }
        }
        @keyframes falling-items-slow-mobile {
          0% { transform: translateY(-120px) rotateZ(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 1; transform: translateY(-50px) rotateZ(45deg) scale(0.8); }
          90% { opacity: 1; }
          100% { transform: translateY(calc(100vh + 120px)) rotateZ(405deg) scale(0.5); opacity: 0; }
        }
        @keyframes falling-small-mobile {
          0% { transform: translateY(-60px) rotateZ(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(calc(100vh + 60px)) rotateZ(720deg); opacity: 0; }
        }
        @keyframes floating-mobile {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .animate-falling-items-mobile { animation: falling-items-mobile infinite linear; }
        .animate-falling-items-slow-mobile { animation: falling-items-slow-mobile infinite ease-in-out; }
        .animate-falling-small-mobile { animation: falling-small-mobile infinite linear; }
        .floating-item-mobile { animation: floating-mobile 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

// Выносим анимированный фон в отдельный компонент
const AnimatedBackground = () => {
  const fallingImages = [
    '/OJS-logo.png',
    '/canvas.png',
    '/platonus.png',
    '/studentclubs-logo.png',
    '/lessons.png',
    '/dormitory-logo.png'
  ];

  // Мемоизируем элементы анимации, чтобы они не пересоздавались
  const animatedElements = useMemo(() => ({
    images: fallingImages.map((imgSrc, i) => ({
      id: `img-${i}`,
      src: imgSrc,
      style: {
        width: '80px',
        height: '80px',
        left: `${10 + (i * 12) % 80}%`,
        top: '-100px',
        animationDelay: `${i * 2}s`,
        animationDuration: `${8 + Math.random() * 4}s`,
      }
    })),
    shapes: [...Array(6)].map((_, i) => ({
      id: `shape-${i}`,
      style: {
        width: '100px',
        height: '100px',
        left: `${20 + (i * 15) % 70}%`,
        top: '-120px',
        animationDelay: `${i * 3 + 1}s`,
        animationDuration: `${12 + Math.random() * 6}s`,
      }
    })),
    dots: [...Array(12)].map((_, i) => ({
      id: `dot-${i}`,
      style: {
        width: '40px',
        height: '40px',
        left: `${5 + (i * 8) % 90}%`,
        top: '-60px',
        animationDelay: `${i * 1.5}s`,
        animationDuration: `${6 + Math.random() * 3}s`,
      }
    }))
  }), []); // Пустой массив зависимостей - элементы создаются только один раз

  return (
    <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
      {/* Слой 1: Падающие PNG изображения */}
      <div className="absolute inset-0">
        {animatedElements.images.map((item) => (
          <div
            key={item.id}
            className="absolute animate-falling-items flex items-center justify-center"
            style={item.style}
          >
            <Image 
              src={item.src}
              alt=""
              width={64}
              height={64}
              className="object-contain drop-shadow-md floating-item"
            />
          </div>
        ))}
      </div>

      {/* Слой 2: Цветные блоки */}
      <div className="absolute inset-0">
        {animatedElements.shapes.map((item) => (
          <div
            key={item.id}
            className="absolute bg-white/60 rounded-2xl shadow-md backdrop-blur-sm border border-indigo-100 animate-falling-items-slow flex items-center justify-center"
            style={item.style}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl"></div>
          </div>
        ))}
      </div>

      {/* Слой 3: Мелкие элементы */}
      <div className="absolute inset-0">
        {animatedElements.dots.map((item) => (
          <div
            key={item.id}
            className="absolute bg-white/40 rounded-lg shadow-sm animate-falling-small"
            style={item.style}
          ></div>
        ))}
      </div>

      {/* Welcome блок */}
      <WelcomeBlock />

      {/* Стили анимаций */}
      <style jsx global>{`
        @keyframes waveMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .wave {
          animation: waveMove 10s linear infinite;
          opacity: 0.85;
        }
        .wave2 {
          animation: waveMove 7s linear infinite reverse;
          opacity: 1;
        }
        @keyframes falling-items {
          0% { transform: translateY(-100px) rotateZ(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(calc(100vh + 100px)) rotateZ(360deg); opacity: 0; }
        }
        @keyframes falling-items-slow {
          0% { transform: translateY(-120px) rotateZ(0deg) scale(0.8); opacity: 0; }
          15% { opacity: 1; transform: translateY(0px) rotateZ(45deg) scale(1); }
          85% { opacity: 1; }
          100% { transform: translateY(calc(100vh + 120px)) rotateZ(405deg) scale(0.8); opacity: 0; }
        }
        @keyframes falling-small {
          0% { transform: translateY(-60px) rotateZ(0deg); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(calc(100vh + 60px)) rotateZ(720deg); opacity: 0; }
        }
        @keyframes floating {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-falling-items { animation: falling-items infinite linear; }
        .animate-falling-items-slow { animation: falling-items-slow infinite ease-in-out; }
        .animate-falling-small { animation: falling-small infinite linear; }
        .floating-item { animation: floating 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

// Выносим Welcome блок в отдельный компонент для лучшей производительности
const WelcomeBlock = () => {
  const { t } = useTranslation('common');
  
  return (
    <div className="relative w-[600px] max-w-3xl bg-white/60 backdrop-blur-s rounded-3xl shadow-xl border-none p-8 h-[820px] flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-70 pointer-events-none"></div>
      
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200/30 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 text-center">
        <div className="mb-8">
          <div className="w-[250px] h-[250px] flex-shrink-0 mx-auto mb-12 rounded-3xl flex items-center justify-center overflow-hidden bg-transparent shadow-none">
            <Image
              src="/yessenov.png"
              alt="Yessenov University"
              width={175}
              height={175}
              className="object-contain"
            />
          </div>
        </div>

        <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent leading-tight drop-shadow-sm">
          {t('login.welcome')}
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed font-medium">
          {t('login.subtitle')}
        </p>
      </div>

      {/* Волны внизу */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none">
        <svg className="wave absolute bottom-0 left-0 w-[200%] h-78" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="rgba(99,102,241,0.08)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,107,1392,101.3L1440,96L1440,320L0,320Z"></path>
        </svg>
        <svg className="wave2 absolute bottom-0 left-0 w-[200%] h-78" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="rgba(59,130,246,0.12)" d="M0,160L48,149.3C96,139,192,117,288,122.7C384,128,480,160,576,176C672,192,768,192,864,170.7C960,149,1056,107,1152,96C1248,85,1344,107,1392,117.3L1440,128L1440,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const { t, i18n } = useTranslation('common');
  const { login, anonymousLogin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [locale, setLocale] = useState('ru');
  // Убираем выбор роли - теперь роль определяется автоматически
  // Enhanced toast notification state
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(
    null
  );
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Инициализация языка (точно как в Header)
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    const initial = savedLocale || i18n.language || 'ru';
    setLocale(initial);
    if (i18n.language !== initial) {
      i18n.changeLanguage(initial);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = initial;
    }
  }, [i18n]);

  // If already authenticated, replace away from /login immediately (client-side UX)
  useEffect(() => {
    try {
      // Presence of auth cookie cannot be read client-side (HttpOnly), so rely on stored user as a hint
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (storedUser) {
        router.replace('/main/news');
      }
    } catch {}
  }, [router]);

  // Функция смены языка (точно как в Header)
  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocale = e.target.value;
    setLocale(selectedLocale);
    localStorage.setItem('locale', selectedLocale);
    i18n.changeLanguage(selectedLocale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = selectedLocale;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      router.replace('/main/news');
    } catch (error: unknown) {
      showToast((error as Error).message || 'Ошибка входа', 'error');
    }
  };

  const handleECPLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      router.replace('/main/news');
    }
  };

  const handleAnonymousLogin = () => {
    anonymousLogin();
    router.replace('/main/news');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Gmail/ИИН
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('login.emailOrIinLabel')}
              </label>
              <input
                type="text"
                placeholder={t('login.emailPlaceholder')}
                className="w-3/4 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 mobile-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="username"
              />
            </div>



            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {t('login.passwordLabel')}
              </label>
              <div className="relative w-3/4 mobile-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"

                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-2 w-3/4">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                  {t('login.forgotPassword')}
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={handleEmailLogin}
              className="w-3/4 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mobile-button"
            >
              {t('login.signInButton')}
            </button>
          </div>
        );
      
      case 1: // eGov QR
        return (
          <div className="space-y-6">
            <div className="text-xs text-gray-600 mb-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col w-64"> 
                  <span className="text-xs font-medium">{t('login.egovStep1')}</span>
                  <span className="text-sm text-blue-600 font-semibold">eGov Mobile / eGov Business</span>
                </div>
                <div className="text-gray-500 text-sm">&gt;</div>
                <div className="w-40">
                  <span className="text-xs text-gray-600">{t('login.egovStep2')}</span>
                </div>
                <div className="text-gray-500 text-sm">&gt;</div>
                <div className="w-48">
                  <span className="text-sm text-gray-600">{t('login.egovStep3')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-80 h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">{t('login.qrCodePlaceholder')}</span>
              </div>
            </div>

            <div className="flex items-start bg-gray-50 rounded-lg p-4 w-full max-w-3xl">
              <svg
                className="w-4 h-4 text-gray-400 mt-1 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t('login.dataProcessingConsent')}
              </p>
            </div>
          </div>
        );
      
      case 2: // ЭЦП
        return (
          <div className="space-y-6">
            <div className="flex items-start p-4 bg-gray-50 rounded-lg w-full max-w-3xl">
              <svg
                className="w-4 h-4 text-gray-400 mt-1 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t('login.dataProcessingConsent')}
              </p>
            </div>

            <div className="w-full max-w-3xl">
              <label htmlFor="certificate-upload" className="block">
                <div
                  className={`w-full border-2 border-dashed rounded-lg p-1 text-center cursor-pointer transition-colors ${
                    selectedFile
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>

                    {selectedFile ? (
                      <>
                        <p className="text-base font-medium text-green-600">
                          {t('login.certificateSelected')}
                        </p>
                        <p className="text-sm text-gray-500 break-all">{selectedFile.name}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-base font-medium text-gray-700">
                          {t('login.selectCertificate')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('login.dragOrClick')}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </label>
              <input
                id="certificate-upload"
                type="file"
                className="hidden"
                accept=".p12,.pfx,.jks,.cer,.crt,.pem,.png"
                onChange={handleFileSelect}
              />
            </div>

            <button
              type="button"
              className="w-full max-w-3xl bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mobile-button"
              disabled={!selectedFile}
              onClick={handleECPLogin}
            >
              {t('login.signInButton')}
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  const tabs = [
    { id: 0, label: t('login.tabs.emailIin') },
    { id: 1, label: t('login.tabs.egovQr') },
    { id: 2, label: t('login.tabs.ecp') }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 relative">
      {/* Mobile Animated Background */}
      <MobileAnimatedBackground />
      
      {/* Left side - Desktop Animated Background */}
      <AnimatedBackground />

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 lg:pl-30 lg:pr-16 pt-8 pb-8 bg-transparent lg:bg-white relative z-5 min-h-screen lg:min-h-0">
        {/* Language Selector - точно как в Header */}
        <div className="flex justify-end mb-8 lg:mb-12 w-full max-w-md mx-auto">
          <select
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white/90"
            onChange={changeLanguage}
            value={locale}
            aria-label={t('aria.languageSelect')}
            suppressHydrationWarning
          >
            <option value="ru">Русский</option>
            <option value="kz">Қазақша</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="w-full max-w-md mx-auto mobile-form-container lg:ml-2 lg:bg-transparent lg:backdrop-blur-none lg:shadow-none lg:border-radius-none lg:p-0 lg:m-0">
          <h1 className="text-2xl lg:text-3xl mb-8 text-blue-600 text-center lg:text-left">
            {t('login.title')}
          </h1>

          <div className="flex border-b border-gray-200 mb-8 mobile-tab-container">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`mr-8 pb-3 text-sm font-medium transition-colors mobile-tab ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {renderTabContent()}

          {activeTab === 0 && (
            <>
              <div className="border-t border-gray-200 my-8"></div>

              <button 
                className="w-3/4 border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mobile-button"
                onClick={handleAnonymousLogin}
              >
                {t('login.anonymousLogin')}
              </button>

              <div className="flex items-start mt-4 p-3 bg-gray-50 rounded-lg w-3/4">
                <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t('login.anonymousLoginDescription')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white font-semibold min-w-[300px] animate-[slideIn_0.3s_ease-out] ${
            toast.type === 'error'
              ? 'bg-gradient-to-r from-red-500 to-pink-600'
              : 'bg-gradient-to-r from-green-500 to-emerald-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/20`}>
              {toast.type === 'error' ? (
                <span className="text-xl">⚠️</span>
              ) : (
                <span className="text-xl">🎉</span>
              )}
            </div>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Toast animation keyframes */}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        /* Дополнительные стили для мобильной адаптации */
        @media (max-width: 1024px) {
          .mobile-form-container {
            background: rgba(255, 255, 255, 0.85);
            border-radius: 20px;
            margin: 20px;
            padding: 30px 20px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .mobile-input {
            width: 100% !important;
            max-width: none !important;
          }
          
          .mobile-button {
            width: 100% !important;
            max-width: none !important;
          }
          
          .mobile-tab-container {
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
          }
          
          .mobile-tab {
            flex: 1;
            min-width: 100px;
            text-align: center;
            padding: 12px 8px;
            font-size: 14px;
          }
          
          .mobile-form-container h1 {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}