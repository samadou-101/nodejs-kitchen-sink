import { Router } from 'express'
import { MemoryDb } from '../../../db/memory-db'
import { NoteRepository } from './repo'
import type { Note } from './repo'
import { NoteService } from './service'
import { NoteController } from './controller'
import { ConsoleLogger } from './logger'

const db = new MemoryDb<Note>()
const logger = new ConsoleLogger()
const repo = new NoteRepository(db)
const service = new NoteService(repo, logger)
const controller = new NoteController(service, logger)

export const noteRouter: Router = Router()

noteRouter.get('/', controller.getAll)
noteRouter.get('/:id', controller.getById)
noteRouter.post('/', controller.create)
noteRouter.put('/:id', controller.update)
noteRouter.delete('/:id', controller.delete)
