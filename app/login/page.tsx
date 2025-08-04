'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Левая часть с анимацией */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-white p-8">
        <AnimatedHexTree />
      </div>

      {/* Правая часть */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16 py-20">
        {/* Язык */}
        <div className="flex justify-end">
          <button className="border px-3 py-1 rounded text-sm text-gray-600 hover:bg-gray-100">
            Русский ▾
          </button>
        </div>

        {/* Контент формы */}
        <div className="w-full max-w-lg mx-auto mt-6">
          <h1 className="text-3xl font-semibold mb-6 text-blue-600">
            Вход в аккаунт YU ID
          </h1>

          {/* Табы */}
          <div className="flex border-b border-gray-300 text-sm text-gray-500 font-medium mb-6">
            {['Gmail/ИИН', 'eGov QR', 'ЭЦП'].map((tab, i) => (
              <button
                key={i}
                className={`mr-6 pb-2 ${
                  i === 0
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'hover:text-blue-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Форма */}
          <form className="space-y-5">
            <div>
              <label className="block text-sm mb-1 text-gray-700">
                Введите почту yu.edu.kz или ИИН
              </label>
              <input
                type="text"
                placeholder="example@yu.edu.kz"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  👁
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="#" className="text-sm text-blue-600 hover:underline">
                Забыли пароль?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
            >
              Войти
            </button>
          </form>

          <div className="border-t my-6"></div>

          <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition">
            Войти анонимно в YU Solution
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Воспользуйтесь анонимным входом, чтобы оставить идею, оценку или сообщить о проблеме.
          </p>
        </div>
      </div>
    </div>
  );
}

const AnimatedHexTree = () => {
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setActivated(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative w-[340px] h-[480px] flex items-center justify-center">
      {/* Горизонтальные линии */}
      <div className="absolute inset-0">
        <div
          className={`absolute left-[50%] top-[100px] h-[60px] w-[2px] ${
            activated ? 'bg-blue-600' : 'bg-gray-300'
          } transition-all duration-700`}
        ></div>
        <div
          className={`absolute left-[50%] top-[260px] h-[60px] w-[2px] ${
            activated ? 'bg-blue-600' : 'bg-gray-300'
          } transition-all duration-700 delay-200`}
        ></div>
      </div>

      {/* Верхние hex-блоки */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-4">
        {['Lessons', 'Calendar', 'Dormitory'].map((item, i) => (
          <div
            key={item}
            className={`w-20 h-20 rounded-xl text-sm flex items-center justify-center border transition-all duration-500 ${
              activated
                ? 'bg-blue-100 border-blue-500 text-blue-700'
                : 'bg-gray-200 border-gray-300 text-gray-600'
            }`}
            style={{ transitionDelay: `${i * 0.15}s` }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Средние hex-блоки */}
      <div className="absolute top-[120px] left-1/2 -translate-x-1/2 flex gap-4">
        {['Student clubs', 'YSJ', 'HelpDesk', 'KPI'].map((item, i) => (
          <div
            key={item}
            className={`w-20 h-20 rounded-xl text-sm flex items-center justify-center border transition-all duration-500 ${
              activated
                ? 'bg-blue-100 border-blue-500 text-blue-700'
                : 'bg-gray-200 border-gray-300 text-gray-600'
            }`}
            style={{ transitionDelay: `${0.5 + i * 0.15}s` }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Центральный логотип YU */}
      <div
        className={`absolute top-[240px] left-1/2 -translate-x-1/2 w-24 h-24 rounded-xl border-2 flex items-center justify-center text-xl font-bold ${
          activated
            ? 'border-blue-600 text-blue-600 bg-white'
            : 'border-gray-300 text-gray-500 bg-white'
        } transition-all duration-500 delay-[900ms]`}
      >
        YU
      </div>

      {/* Нижние круги */}
      <div className="absolute top-[330px] left-1/2 -translate-x-1/2 flex gap-4">
        {['OIS', 'Bitrix24', 'Canvas'].map((item, i) => (
          <div
            key={item}
            className={`w-14 h-14 rounded-full text-xs flex items-center justify-center border transition-all duration-500 ${
              activated
                ? 'bg-blue-100 border-blue-500 text-blue-700'
                : 'bg-gray-200 border-gray-300 text-gray-600'
            }`}
            style={{ transitionDelay: `${1 + i * 0.15}s` }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};
