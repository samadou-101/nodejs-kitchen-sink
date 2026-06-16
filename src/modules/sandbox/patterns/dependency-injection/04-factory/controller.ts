import type { Request, Response } from 'express'
import { NoteServiceFactory } from './service-factory'
import { defaultConfig } from './config'

const service = NoteServiceFactory.create(defaultConfig)

export class NoteController {
  getAll = async (_req: Request, res: Response) => {
    const notes = await service.getAll()
    res.json(notes)
  }

  getById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const note = await service.getById(id)
    if (!note) return res.status(404).json({ error: 'Note not found' })
    res.json(note)
  }

  create = async (req: Request, res: Response) => {
    const note = await service.create(req.body)
    res.status(201).json(note)
  }

  update = async (req: Request, res: Response) => {
    const id = req.params.id as string
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const note = await service.update(id, req.body)
    if (!note) return res.status(404).json({ error: 'Note not found' })
    res.json(note)
  }

  delete = async (req: Request, res: Response) => {
    const id = req.params.id as string
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const deleted = await service.delete(id)
    if (!deleted) return res.status(404).json({ error: 'Note not found' })
    res.status(204).send()
  }
}
