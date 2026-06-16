import { NoteRepository } from './repo'
import type { Note } from './repo'
import type { Logger } from './logger'
import type { Notifier } from './notifier'

export class NoteService {
  constructor(
    private repo: NoteRepository,
    private logger: Logger,
    private notifier: Notifier,
  ) {}

  async getAll(): Promise<Note[]> {
    this.logger.info('Fetching all notes')
    return this.repo.findAll()
  }

  async getById(id: string): Promise<Note | null> {
    this.logger.info('Fetching note by id', id)
    return this.repo.findById(id)
  }

  async create(data: { title: string; content: string }): Promise<Note> {
    this.logger.info('Creating note', data.title)
    const note: Note = {
      id: crypto.randomUUID(),
      title: data.title,
      content: data.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const created = await this.repo.create(note)
    await this.notifier.send('admin@notes.app', 'Note Created', `Note "${data.title}" was created.`)
    return created
  }

  async update(id: string, data: { title?: string; content?: string }): Promise<Note | null> {
    this.logger.info('Updating note', id)
    const existing = await this.repo.findById(id)
    if (!existing) return null
    const updated = await this.repo.update(id, { ...data, updatedAt: new Date() })
    await this.notifier.send('admin@notes.app', 'Note Updated', `Note "${id}" was updated.`)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    this.logger.info('Deleting note', id)
    const deleted = await this.repo.delete(id)
    if (deleted) {
      await this.notifier.send('admin@notes.app', 'Note Deleted', `Note "${id}" was deleted.`)
    }
    return deleted
  }
}
