import { Router } from 'express'
import { Container } from './container'
import { MemoryDb } from '../../../db/memory-db'
import { MemoryNoteRepository } from './repo'
import { ConsoleLogger } from './logger'
import { NoteService } from './service'
import { NoteController } from './controller'
import type { Note } from './interfaces'

const container = new Container()

container.register('db', () => new MemoryDb<Note>())
container.register('logger', () => new ConsoleLogger())
container.register('repo', (c) => new MemoryNoteRepository(c.resolve<MemoryDb<Note>>('db')))
container.register('service', (c) => new NoteService(c.resolve('repo'), c.resolve('logger')))
container.register('controller', (c) => new NoteController(c.resolve('service')))

const controller = container.resolve<NoteController>('controller')

export const noteRouter: Router = Router()

noteRouter.get('/', controller.getAll)
noteRouter.get('/:id', controller.getById)
noteRouter.post('/', controller.create)
noteRouter.put('/:id', controller.update)
noteRouter.delete('/:id', controller.delete)
