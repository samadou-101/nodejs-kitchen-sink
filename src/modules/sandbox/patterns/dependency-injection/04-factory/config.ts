export interface AppConfig {
  storage: 'memory' | 'postgres'
  enableLogging: boolean
}

export const defaultConfig: AppConfig = {
  storage: 'memory',
  enableLogging: true,
}
