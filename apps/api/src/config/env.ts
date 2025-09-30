import 'dotenv/config';

type AppConfig = {
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  refreshSecret: string;
  smtpHost: string;
  smtpPort: number;
  smsGatewayApiKey: string;
};

const requiredEnv = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMS_GATEWAY_API_KEY',
] as const;

type RequiredEnv = (typeof requiredEnv)[number];

function ensureEnv(): Record<RequiredEnv, string> {
  const output = {} as Record<RequiredEnv, string>;
  for (const key of requiredEnv) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required env var ${key}`);
    }
    output[key] = value;
  }
  return output;
}

const env = ensureEnv();

export const appConfig: AppConfig = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: env.DATABASE_URL,
  redisUrl: env.REDIS_URL,
  jwtSecret: env.JWT_SECRET,
  refreshSecret: env.REFRESH_TOKEN_SECRET,
  smtpHost: env.SMTP_HOST,
  smtpPort: Number(env.SMTP_PORT),
  smsGatewayApiKey: env.SMS_GATEWAY_API_KEY,
};
