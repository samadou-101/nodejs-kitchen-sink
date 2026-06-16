import type { Request, Response } from 'express'
import type { INoteService } from './interfaces'
import type { CreateNoteDto, UpdateNoteDto } from './interfaces'

export class NoteController {
  constructor(private service: INoteService) {}

  getAll = async (_req: Request, res: Response) => {
    const notes = await this.service.getAll()
    res.json(notes)
  }

  getById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const note = await this.service.getById(id)
    if (!note) return res.status(404).json({ error: 'Note not found' })
    res.json(note)
  }

  create = async (req: Request, res: Response) => {
    const dto: CreateNoteDto = req.body
    const note = await this.service.create(dto)
    res.status(201).json(note)
  }

  update = async (req: Request, res: Response) => {
    const id = req.params.id as string
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const dto: UpdateNoteDto = req.body
    const note = await this.service.update(id, dto)
    if (!note) return res.status(404).json({ error: 'Note not found' })
    res.json(note)
  }

  delete = async (req: Request, res: Response) => {
    const id = req.params.id as string
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const deleted = await this.service.delete(id)
    if (!deleted) return res.status(404).json({ error: 'Note not found' })
    res.status(204).send()
  }
}
