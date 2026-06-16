export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface INoteRepository {
  findAll(): Promise<Note[]>
  findById(id: string): Promise<Note | null>
  create(note: Note): Promise<Note>
  update(id: string, data: Partial<Note>): Promise<Note | null>
  delete(id: string): Promise<boolean>
}

export interface Logger {
  info(msg: string, ...meta: unknown[]): void
  error(msg: string, ...meta: unknown[]): void
}
