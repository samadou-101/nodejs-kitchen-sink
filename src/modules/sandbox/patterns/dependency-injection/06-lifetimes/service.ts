import type { INoteRepository, Note } from './interfaces'
import type { ClockService } from './clock'

export class NoteService {
  readonly instanceId = crypto.randomUUID()

  constructor(
    private repo: INoteRepository,
    private clock: ClockService,
  ) {}

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
      createdAt: this.clock.now(),
      updatedAt: this.clock.now(),
    }
    return this.repo.create(note)
  }

  async update(id: string, data: { title?: string; content?: string }): Promise<Note | null> {
    const existing = await this.repo.findById(id)
    if (!existing) return null
    return this.repo.update(id, { ...data, updatedAt: this.clock.now() })
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id)
  }
}
