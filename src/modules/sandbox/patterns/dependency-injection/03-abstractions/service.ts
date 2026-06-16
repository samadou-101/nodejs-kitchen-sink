import type { INoteRepository, INoteService, Note, CreateNoteDto, UpdateNoteDto } from './interfaces'

export class NoteService implements INoteService {
  constructor(private repo: INoteRepository) {}

  async getAll(): Promise<Note[]> {
    return this.repo.findAll()
  }

  async getById(id: string): Promise<Note | null> {
    return this.repo.findById(id)
  }

  async create(data: CreateNoteDto): Promise<Note> {
    const note: Note = {
      id: crypto.randomUUID(),
      title: data.title,
      content: data.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return this.repo.create(note)
  }

  async update(id: string, data: UpdateNoteDto): Promise<Note | null> {
    const existing = await this.repo.findById(id)
    if (!existing) return null
    return this.repo.update(id, { ...data, updatedAt: new Date() })
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id)
  }
}
