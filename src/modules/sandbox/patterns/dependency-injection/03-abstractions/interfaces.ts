export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateNoteDto {
  title: string
  content: string
}

export interface UpdateNoteDto {
  title?: string
  content?: string
}

export interface INoteRepository {
  findAll(): Promise<Note[]>
  findById(id: string): Promise<Note | null>
  create(note: Note): Promise<Note>
  update(id: string, data: Partial<Note>): Promise<Note | null>
  delete(id: string): Promise<boolean>
}

export interface INoteService {
  getAll(): Promise<Note[]>
  getById(id: string): Promise<Note | null>
  create(data: CreateNoteDto): Promise<Note>
  update(id: string, data: UpdateNoteDto): Promise<Note | null>
  delete(id: string): Promise<boolean>
}
