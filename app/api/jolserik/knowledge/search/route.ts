import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'

interface KnowledgeDocument {
  id: string;
  filename: string;
  category: string;
  content: string;
  chunks: string[];
  filePath: string;
  createdAt: string;
}

interface SearchResult {
  content: string;
  filename: string;
  category: string;
  score: number;
}

interface SearchRequest {
  query: string;
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 5 }: SearchRequest = await request.json()
    
    // Загружаем базу знаний
    const knowledge = await loadKnowledgeBase()
    
    // Простой поиск по ключевым словам (можно улучшить векторным поиском)
    const results = searchInKnowledge(query, knowledge, limit)
    
    // Если есть OpenAI API, используем его для генерации ответа
    let aiResponse = null
    if (process.env.OPENAI_API_KEY && results.length > 0) {
      aiResponse = await generateAIResponse(query, results)
    }

    return NextResponse.json({
      success: true,
      results,
      aiResponse,
      sources: results.map(r => r.filename)
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

async function loadKnowledgeBase(): Promise<KnowledgeDocument[]> {
  const fs = await import('fs/promises')
  const knowledgeFile = join(process.cwd(), 'knowledge_base', 'index.json')
  
  try {
    const data = await fs.readFile(knowledgeFile, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function searchInKnowledge(query: string, knowledge: KnowledgeDocument[], limit: number): SearchResult[] {
  const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2)
  const results: SearchResult[] = []

  for (const doc of knowledge) {
    for (const chunk of doc.chunks) {
      let score = 0
      const chunkLower = chunk.toLowerCase()
      
      // Подсчитываем релевантность
      for (const word of queryWords) {
        const matches = (chunkLower.match(new RegExp(word, 'g')) || []).length
        score += matches
      }
      
      if (score > 0) {
        results.push({
          content: chunk,
          filename: doc.filename,
          category: doc.category,
          score
        })
      }
    }
  }

  // Сортируем по релевантности и возвращаем топ результатов
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

async function generateAIResponse(query: string, context: SearchResult[]): Promise<string | null> {
  const contextText = context.map(c => c.content).join('\n\n')
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Ты Jolserik AI - помощник студентов Yessenov University. 
            
            Отвечай на русском языке, используя предоставленную информацию из документов университета.
            Если информации недостаточно, честно скажи об этом.
            Используй эмодзи и структурируй ответ для лучшего восприятия.
            
            КОНТЕКСТ ИЗ ДОКУМЕНТОВ:
            ${contextText}`
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    const data = await response.json()
    return data.choices[0]?.message?.content || null

  } catch (error) {
    console.error('OpenAI API Error:', error)
    return null
  }
}