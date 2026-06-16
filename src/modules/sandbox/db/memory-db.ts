export class MemoryDb<T extends { id: string }> {
  private store = new Map<string, T>()

  async findAll(): Promise<T[]> {
    return Array.from(this.store.values())
  }

  async findById(id: string): Promise<T | null> {
    return this.store.get(id) ?? null
  }

  async create(item: T): Promise<T> {
    this.store.set(item.id, item)
    return item
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const existing = this.store.get(id)
    if (!existing) return null
    const updated = { ...existing, ...data }
    this.store.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id)
  }
}
