export interface Notifier {
  send(to: string, subject: string, body: string): Promise<void>
}

export class ConsoleNotifier implements Notifier {
  async send(to: string, subject: string, body: string) {
    console.log(`[NOTIFICATION] To: ${to} | Subject: ${subject} | Body: ${body}`)
  }
}
