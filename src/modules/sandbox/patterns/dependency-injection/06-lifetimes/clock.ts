export class ClockService {
  readonly instanceId = crypto.randomUUID()

  constructor() {
    console.log(`[ClockService] Created instance ${this.instanceId}`)
  }

  now(): Date {
    return new Date()
  }
}
