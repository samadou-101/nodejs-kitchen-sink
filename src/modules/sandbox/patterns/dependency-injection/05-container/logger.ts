import type { Logger } from './interfaces'

export class ConsoleLogger implements Logger {
  info(msg: string, ...meta: unknown[]) {
    console.log(`[INFO] ${msg}`, ...meta)
  }

  error(msg: string, ...meta: unknown[]) {
    console.error(`[ERROR] ${msg}`, ...meta)
  }
}
