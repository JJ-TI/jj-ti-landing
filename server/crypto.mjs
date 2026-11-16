import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
export const hash = (key, value) => createHmac('sha256', key).update(value).digest('hex');
export function encrypt(key, value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64');
}
export function decrypt(key, value) {
  const bytes = Buffer.from(value, 'base64');
  const cipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(0, 12));
  cipher.setAuthTag(bytes.subarray(12, 28));
  return JSON.parse(Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]).toString('utf8'));
}
export function token(key, id) {
  const body = `${id}.${Date.now()}`;
  return `${body}.${hash(key, body)}`;
}
export function verifyToken(key, value) {
  if (typeof value !== 'string' || value.length > 200) return null;
  const [id, timestamp, signature] = value.split('.');
  if (!/^[a-f0-9-]{36}$/.test(id || '') || !/^\d{13}$/.test(timestamp || '') || !/^[a-f0-9]{64}$/.test(signature || '')) return null;
  const age = Date.now() - Number(timestamp);
  if (age < 0 || age > 86400000) return null;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(hash(key, `${id}.${timestamp}`))) ? id : null;
}
