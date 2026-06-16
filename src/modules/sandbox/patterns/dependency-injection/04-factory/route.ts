import { Router } from 'express'
import { NoteController } from './controller'

const controller = new NoteController()

export const noteRouter: Router = Router()

noteRouter.get('/', controller.getAll)
noteRouter.get('/:id', controller.getById)
noteRouter.post('/', controller.create)
noteRouter.put('/:id', controller.update)
noteRouter.delete('/:id', controller.delete)
