import type { Logger } from './interfaces'

export class ConsoleLogger implements Logger {
  info(msg: string, ...meta: unknown[]) {
    console.log(`[INFO] ${msg}`, ...meta)
  }

  error(msg: string, ...meta: unknown[]) {
    console.error(`[ERROR] ${msg}`, ...meta)
  }
}

export class NullLogger implements Logger {
  info(_msg: string, ..._meta: unknown[]) {}
  error(_msg: string, ..._meta: unknown[]) {}
}
