import { Router } from 'express'
import { LifetimeContainer } from './lifetime-container'
import { MemoryDb } from '../../../db/memory-db'
import { MemoryNoteRepository } from './repo'
import { ClockService } from './clock'
import { NoteService } from './service'
import { NoteController } from './controller'
import type { Note } from './interfaces'

const container = new LifetimeContainer()

container.register('db', () => new MemoryDb<Note>(), 'singleton')
container.register('clock', () => new ClockService(), 'singleton')
container.register('repo', (c) => new MemoryNoteRepository(c.resolve('db')), 'singleton')
container.register('service', (c) => new NoteService(c.resolve('repo'), c.resolve('clock')), 'transient')
container.register('controller', (c) => new NoteController(c.resolve('service')), 'transient')

const controller = container.resolve<NoteController>('controller')

export const noteRouter: Router = Router()

noteRouter.get('/', controller.getAll)
noteRouter.get('/:id', controller.getById)
noteRouter.post('/', controller.create)
noteRouter.put('/:id', controller.update)
noteRouter.delete('/:id', controller.delete)
