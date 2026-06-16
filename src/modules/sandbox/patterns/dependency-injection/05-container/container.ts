type Factory<T> = (container: Container) => T

export class Container {
  private factories = new Map<string, Factory<unknown>>()
  private singletons = new Map<string, unknown>()

  register<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory)
  }

  resolve<T>(key: string): T {
    const factory = this.factories.get(key)
    if (!factory) throw new Error(`No factory registered for "${key}"`)
    return factory(this) as T
  }

  resolveSingleton<T>(key: string): T {
    if (!this.singletons.has(key)) {
      this.singletons.set(key, this.resolve<T>(key))
    }
    return this.singletons.get(key) as T
  }
}
