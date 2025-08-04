'use client';

import { motion } from "framer-motion";
import { useState } from "react";

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log(form); // заменить на fetch в будущем
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md"
    >
      <h2 className="text-2xl font-semibold mb-6">Вход в аккаунт YU ID</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="example@yu.edu.kz"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          onChange={handleChange}
          required
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
        >
          Войти
        </motion.button>
      </form>

      <div className="text-right mt-2">
        <a href="#" className="text-sm text-blue-600">Забыли пароль?</a>
      </div>

      <div className="border-t mt-6 pt-4">
        <button className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg">
          Войти анонимно в YU Solution
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Воспользуйтесь анонимным входом, чтобы оставить идею, оценку или сообщить о проблеме.
        </p>
      </div>
    </motion.div>
  );
}
