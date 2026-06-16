import { MemoryDb } from '../../../db/memory-db'

export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export class NoteRepository {
  constructor(private db: MemoryDb<Note>) {}

  async findAll(): Promise<Note[]> {
    return this.db.findAll()
  }

  async findById(id: string): Promise<Note | null> {
    return this.db.findById(id)
  }

  async create(note: Note): Promise<Note> {
    return this.db.create(note)
  }

  async update(id: string, data: Partial<Note>): Promise<Note | null> {
    return this.db.update(id, data)
  }

  async delete(id: string): Promise<boolean> {
    return this.db.delete(id)
  }
}
