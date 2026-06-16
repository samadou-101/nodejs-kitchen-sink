import { NoteRepository } from './repo'
import type { Note } from './repo'

export class NoteService {
  constructor(private repo: NoteRepository) {}

  async getAll(): Promise<Note[]> {
    return this.repo.findAll()
  }

  async getById(id: string): Promise<Note | null> {
    return this.repo.findById(id)
  }

  async create(data: { title: string; content: string }): Promise<Note> {
    const note: Note = {
      id: crypto.randomUUID(),
      title: data.title,
      content: data.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return this.repo.create(note)
  }

  async update(id: string, data: { title?: string; content?: string }): Promise<Note | null> {
    const existing = await this.repo.findById(id)
    if (!existing) return null
    return this.repo.update(id, { ...data, updatedAt: new Date() })
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id)
  }
}
