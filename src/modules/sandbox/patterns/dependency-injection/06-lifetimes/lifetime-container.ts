export type Lifetime = 'singleton' | 'transient' | 'scoped'

type Factory<T> = (container: LifetimeContainer) => T

interface Registration<T> {
  factory: Factory<T>
  lifetime: Lifetime
}

export class LifetimeContainer {
  private registrations = new Map<string, Registration<unknown>>()
  private singletons = new Map<string, unknown>()
  private scoped = new Map<string, unknown>()

  register<T>(key: string, factory: Factory<T>, lifetime: Lifetime = 'transient'): void {
    this.registrations.set(key, { factory, lifetime })
  }

  resolve<T>(key: string): T {
    const reg = this.registrations.get(key)
    if (!reg) throw new Error(`No registration for "${key}"`)

    if (reg.lifetime === 'singleton') {
      if (!this.singletons.has(key)) {
        this.singletons.set(key, reg.factory(this))
      }
      return this.singletons.get(key) as T
    }

    if (reg.lifetime === 'scoped') {
      if (!this.scoped.has(key)) {
        this.scoped.set(key, reg.factory(this))
      }
      return this.scoped.get(key) as T
    }

    return reg.factory(this) as T
  }

  createScope(): LifetimeContainer {
    const child = new LifetimeContainer()
    child.registrations = this.registrations
    for (const [key, reg] of this.registrations) {
      if (reg.lifetime === 'singleton') {
        child.singletons.set(key, this.resolve(key))
      }
    }
    return child
  }
}
