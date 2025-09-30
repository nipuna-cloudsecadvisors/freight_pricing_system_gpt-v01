export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface SmsPayload {
  to: string;
  message: string;
}

export interface EmailProvider {
  send(payload: EmailPayload): Promise<void>;
}

export interface SmsProvider {
  send(payload: SmsPayload): Promise<void>;
}

export class ConsoleEmailProvider implements EmailProvider {
  async send(payload: EmailPayload): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.info('[email]', payload);
    }
  }
}

export class ConsoleSmsProvider implements SmsProvider {
  async send(payload: SmsPayload): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.info('[sms]', payload);
    }
  }
}
