import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Создаем папку для документов
    const uploadsDir = join(process.cwd(), 'knowledge_base')
    await mkdir(uploadsDir, { recursive: true })

    // Сохраняем файл
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadsDir, `${Date.now()}-${file.name}`)
    await writeFile(filePath, buffer)

    // Обрабатываем документ и создаем векторы
    const processedContent = await processDocument(filePath, file.type)
    
    // Сохраняем в базу знаний
    await saveToKnowledgeBase({
      filename: file.name,
      category,
      content: processedContent.text,
      chunks: processedContent.chunks,
      filePath
    })

    return NextResponse.json({
      success: true,
      message: 'Document processed successfully',
      chunks: processedContent.chunks.length
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// Обработка различных типов документов
async function processDocument(filePath: string, mimeType: string) {
  let text = ''
  
  if (mimeType === 'text/plain') {
    const fs = await import('fs/promises')
    text = await fs.readFile(filePath, 'utf-8')
  } else if (mimeType === 'application/pdf') {
    // Используем pdf-parse для PDF
    const pdfParse = await import('pdf-parse')
    const fs = await import('fs/promises')
    const buffer = await fs.readFile(filePath)
    const data = await pdfParse.default(buffer)
    text = data.text
  } else if (mimeType.includes('word')) {
    // Используем mammoth для Word документов
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ path: filePath })
    text = result.value
  }

  // Разбиваем на чанки для лучшего поиска
  const chunks = splitIntoChunks(text, 500) // 500 символов на чанк
  
  return { text, chunks }
}

function splitIntoChunks(text: string, chunkSize: number): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

async function saveToKnowledgeBase(data: any) {
  // Здесь сохраняем в базу данных или JSON файл
  const fs = await import('fs/promises')
  const knowledgeFile = join(process.cwd(), 'knowledge_base', 'index.json')
  
  let knowledge = []
  try {
    const existing = await fs.readFile(knowledgeFile, 'utf-8')
    knowledge = JSON.parse(existing)
  } catch {
    // Файл не существует, создаем новый
  }

  knowledge.push({
    id: Date.now().toString(),
    ...data,
    createdAt: new Date().toISOString()
  })

  await fs.writeFile(knowledgeFile, JSON.stringify(knowledge, null, 2))
}
