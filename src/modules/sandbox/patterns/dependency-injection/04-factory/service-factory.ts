import { MemoryDb } from '../../../db/memory-db'
import { MemoryNoteRepository } from './repo'
import { NoteService } from './service'
import { ConsoleLogger, NullLogger } from './logger'
import type { AppConfig } from './config'
import type { Note, INoteRepository, Logger } from './interfaces'

export class NoteServiceFactory {
  static create(config: AppConfig) {
    const logger: Logger = config.enableLogging
      ? new ConsoleLogger()
      : new NullLogger()

    let repo: INoteRepository

    switch (config.storage) {
      case 'memory':
      default: {
        const db = new MemoryDb<Note>()
        repo = new MemoryNoteRepository(db)
        break
      }
    }

    return new NoteService(repo, logger)
  }
}
