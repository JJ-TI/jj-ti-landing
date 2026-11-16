export function readConfig(env = process.env) {
  const required = ['DATABASE_URL', 'SITE_ORIGIN', 'DATA_KEY', 'ANALYTICS_KEY', 'IP_RATE_KEY'];
  for (const key of required) if (!env[key]) throw new Error(`Missing configuration: ${key}`);
  for (const key of ['DATA_KEY', 'ANALYTICS_KEY', 'IP_RATE_KEY']) {
    if (!/^[a-f0-9]{64}$/.test(env[key])) throw new Error(`${key} must be 32 random bytes in hex`);
  }
  if (new Set([env.DATA_KEY, env.ANALYTICS_KEY, env.IP_RATE_KEY]).size !== 3) throw new Error('Use independent keys');
  const url = new URL(env.SITE_ORIGIN);
  if (url.protocol !== 'https:' && !['localhost','127.0.0.1'].includes(url.hostname)) throw new Error('SITE_ORIGIN requires HTTPS');
  return {
    databaseUrl: env.DATABASE_URL, siteOrigin: url.origin,
    dataKey: Buffer.from(env.DATA_KEY, 'hex'), analyticsKey: env.ANALYTICS_KEY, rateKey: env.IP_RATE_KEY,
    port: Number(env.PORT || 3000), metricsPort: Number(env.METRICS_PORT || 9464),
    smtpHost: env.SMTP_HOST, smtpPort: Number(env.SMTP_PORT || 587), smtpSecure: env.SMTP_SECURE === 'true',
    smtpUser: env.SMTP_USER, smtpPass: env.SMTP_PASS, smtpFrom: env.SMTP_FROM, smtpTo: env.SMTP_TO || 'info@jj-ti.net',
    smtpAllowPlain: env.NODE_ENV === 'test' && env.SMTP_ALLOW_PLAIN === 'true',
    trustedProxies: env.TRUSTED_PROXIES ? env.TRUSTED_PROXIES.split(',') : false,
    version: env.RELEASE_SHA || 'development', environment: env.NODE_ENV || 'development',
  };
}
