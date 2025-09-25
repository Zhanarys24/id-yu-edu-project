import { NextResponse } from 'next/server'
import { join } from 'path'

export async function GET() {
  try {
    const fs = await import('fs/promises')
    const knowledgeFile = join(process.cwd(), 'knowledge_base', 'index.json')
    
    let documents = []
    try {
      const data = await fs.readFile(knowledgeFile, 'utf-8')
      documents = JSON.parse(data)
    } catch {
      // Файл не существует, возвращаем пустой массив
    }

    return NextResponse.json({
      success: true,
      documents: documents.map((doc: any) => ({
        id: doc.id,
        filename: doc.filename,
        category: doc.category,
        chunks: doc.chunks,
        createdAt: doc.createdAt
      }))
    })

  } catch (error) {
    console.error('Error loading documents:', error)
    return NextResponse.json({ error: 'Failed to load documents' }, { status: 500 })
  }
}
