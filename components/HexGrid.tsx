'use client';

import { motion } from "framer-motion";

const hexItems = [
  { label: "Lessons", delay: 0 },
  { label: "Calendar", delay: 0.1 },
  { label: "Dormitory", delay: 0.2 },
  { label: "Student clubs", delay: 0.3 },
  { label: "YSJ", delay: 0.4 },
  { label: "HelpDesk", delay: 0.5 },
  { label: "KPI", delay: 0.6 },
];

const bottomItems = [
  { label: "OIS", delay: 0.7 },
  { label: "Bitrix", delay: 0.8 },
  { label: "Canvas", delay: 0.9 },
];

export default function HexGrid() {
  return (
    <div className="flex flex-col items-center">
      {/* Верхние иконки */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {hexItems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item.delay, duration: 0.6 }}
            className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center text-sm"
          >
            {item.label}
          </motion.div>
        ))}
      </div>

      {/* Центральная иконка */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        className="w-24 h-24 bg-white border-2 border-blue-500 rounded-xl mb-6 flex items-center justify-center"
      >
        <span className="text-blue-600 font-bold text-xl">YU</span>
      </motion.div>

      {/* Нижние иконки */}
      <div className="flex gap-4">
        {bottomItems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item.delay, duration: 0.6 }}
            className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-xs"
          >
            {item.label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
