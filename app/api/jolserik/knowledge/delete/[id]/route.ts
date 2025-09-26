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

interface DocumentSummary {
  id: string;
  filename: string;
  category: string;
  chunks: string[];
  createdAt: string;
}

export async function GET() {
  try {
    const fs = await import('fs/promises')
    const knowledgeFile = join(process.cwd(), 'knowledge_base', 'index.json')
    
    let documents: KnowledgeDocument[] = []
    try {
      const data = await fs.readFile(knowledgeFile, 'utf-8')
      documents = JSON.parse(data)
    } catch {
      // Файл не существует, возвращаем пустой массив
    }

    return NextResponse.json({
      success: true,
      documents: documents.map((doc: KnowledgeDocument): DocumentSummary => ({
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fs = await import('fs/promises')
    const knowledgeFile = join(process.cwd(), 'knowledge_base', 'index.json')
    
    let documents: KnowledgeDocument[] = []
    try {
      const data = await fs.readFile(knowledgeFile, 'utf-8')
      documents = JSON.parse(data)
    } catch {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 })
    }

    // Находим и удаляем документ
    const docIndex = documents.findIndex((doc: KnowledgeDocument) => doc.id === id)
    if (docIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const docToDelete = documents[docIndex]
    documents.splice(docIndex, 1)

    // Сохраняем обновленный список
    await fs.writeFile(knowledgeFile, JSON.stringify(documents, null, 2))

    // Удаляем файл с диска
    try {
      await fs.unlink(docToDelete.filePath)
    } catch {
      // Файл уже удален или не существует
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
