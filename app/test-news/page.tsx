'use client'

import { useState } from 'react'

interface NewsResult {
  success?: boolean;
  news?: unknown[];
  count?: number;
  debug?: {
    apiCount?: number;
    cached?: boolean;
    totalResults?: number;
  };
  error?: string;
  message?: string;
}

export default function TestNewsPage() {
  const [result, setResult] = useState<NewsResult | null>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/news/parse')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Тест API новостей</h1>
      <button
        onClick={testAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Тестирование...' : 'Тестировать API'}
      </button>
      
      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Результат:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
