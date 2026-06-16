import { LifetimeContainer } from './lifetime-container'
import { MemoryDb } from '../../../db/memory-db'
import { MemoryNoteRepository } from './repo'
import { ClockService } from './clock'
import { NoteService } from './service'
import type { Note } from './interfaces'

const root = new LifetimeContainer()

root.register('db', () => new MemoryDb<Note>(), 'singleton')
root.register('clock', () => new ClockService(), 'singleton')
root.register('repo', (c) => new MemoryNoteRepository(c.resolve('db')), 'singleton')
root.register('service', (c) => new NoteService(c.resolve('repo'), c.resolve('clock')), 'scoped')
root.register('logger', () => ({ id: crypto.randomUUID() }), 'transient')

console.log('=== Root container ===')
const s1 = root.resolve<NoteService>('service')
const s2 = root.resolve<NoteService>('service')
console.log('scoped (root) same instance?', s1.instanceId === s2.instanceId)

const t1 = root.resolve<{ id: string }>('logger')
const t2 = root.resolve<{ id: string }>('logger')
console.log('transient (root) same instance?', t1.id === t2.id)

console.log('\n=== Scope A ===')
const scopeA = root.createScope()
const a1 = scopeA.resolve<NoteService>('service')
const a2 = scopeA.resolve<NoteService>('service')
console.log('scoped (scopeA) same instance?', a1.instanceId === a2.instanceId)
console.log('scopeA vs root service?', a1.instanceId === s1.instanceId)

console.log('\n=== Scope B ===')
const scopeB = root.createScope()
const b1 = scopeB.resolve<NoteService>('service')
console.log('scopeB vs scopeA service?', b1.instanceId === a1.instanceId)

console.log('\n=== Clock (singleton) shared ===')
const clockA = scopeA.resolve<ClockService>('clock')
const clockB = scopeB.resolve<ClockService>('clock')
console.log('clock shared across scopes?', clockA.instanceId === clockB.instanceId)

console.log('\n=== Transient always fresh ===')
const ta = scopeA.resolve<{ id: string }>('logger')
const tb = scopeB.resolve<{ id: string }>('logger')
console.log('scopeA vs scopeB logger?', ta.id === tb.id)
