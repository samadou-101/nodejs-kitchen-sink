import type { Request, Response } from 'express'
import { NoteService } from './service'
import type { Logger } from './logger'

export class NoteController {
  constructor(
    private service: NoteService,
    private logger: Logger,
  ) {}

  getAll = async (_req: Request, res: Response) => {
    const notes = await this.service.getAll()
    res.json(notes)
  }

  getById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    if (!id) {
      this.logger.error('Missing id in getById')
      return res.status(400).json({ error: 'Missing id' })
    }
    const note = await this.service.getById(id)
    if (!note) {
      this.logger.error('Note not found', id)
      return res.status(404).json({ error: 'Note not found' })
    }
    res.json(note)
  }

  create = async (req: Request, res: Response) => {
    const note = await this.service.create(req.body)
    this.logger.info('Note created', note.id)
    res.status(201).json(note)
  }

  update = async (req: Request, res: Response) => {
    const id = req.params.id as string
    if (!id) {
      this.logger.error('Missing id in update')
      return res.status(400).json({ error: 'Missing id' })
    }
    const note = await this.service.update(id, req.body)
    if (!note) {
      this.logger.error('Note not found for update', id)
      return res.status(404).json({ error: 'Note not found' })
    }
    res.json(note)
  }

  delete = async (req: Request, res: Response) => {
    const id = req.params.id as string
    if (!id) {
      this.logger.error('Missing id in delete')
      return res.status(400).json({ error: 'Missing id' })
    }
    const deleted = await this.service.delete(id)
    if (!deleted) {
      this.logger.error('Note not found for delete', id)
      return res.status(404).json({ error: 'Note not found' })
    }
    res.status(204).send()
  }
}
