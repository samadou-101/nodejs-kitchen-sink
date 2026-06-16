import type { INoteRepository, Logger, Note, CreateNoteDto, UpdateNoteDto } from './interfaces'

export class NoteService {
  constructor(
    private repo: INoteRepository,
    private logger: Logger,
  ) {}

  async getAll(): Promise<Note[]> {
    this.logger.info('Fetching all notes')
    return this.repo.findAll()
  }

  async getById(id: string): Promise<Note | null> {
    this.logger.info('Fetching note by id', id)
    return this.repo.findById(id)
  }

  async create(data: CreateNoteDto): Promise<Note> {
    this.logger.info('Creating note', data.title)
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
    this.logger.info('Updating note', id)
    const existing = await this.repo.findById(id)
    if (!existing) return null
    return this.repo.update(id, { ...data, updatedAt: new Date() })
  }

  async delete(id: string): Promise<boolean> {
    this.logger.info('Deleting note', id)
    return this.repo.delete(id)
  }
}
