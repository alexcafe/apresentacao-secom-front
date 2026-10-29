// Lê .env.local e gera códigos TOTP (RFC 6238) para o 2FA do usuário temporário.
import { readFileSync, appendFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';

export function lerEnv() {
  const env = {};
  for (const linha of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
    const m = linha.replace(/^﻿/, '').match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

export function gravarEnv(chave, valor) {
  appendFileSync(new URL('../.env.local', import.meta.url), `${chave}=${valor}\n`);
}

function base32(seg) {
  const alfa = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const c of seg.replace(/[\s=]/g, '').toUpperCase()) bits += alfa.indexOf(c).toString(2).padStart(5, '0');
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

export function totp(segredo, passo = 30, agora = Date.now()) {
  const contador = Math.floor(agora / 1000 / passo);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(contador));
  const h = createHmac('sha1', base32(segredo)).update(buf).digest();
  const o = h[h.length - 1] & 0xf;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1e6).padStart(6, '0');
}
