import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import { sql } from '../../lib/db';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const data = await request.json().catch(() => ({}));
    const email = String(data.email || '').trim().toLowerCase();
    const role = String(data.role || '').slice(0, 32);
    const company = String(data.company || '').slice(0, 120);
    const source = String(data.source || 'unknown').slice(0, 32);
    const honeypot = String(data.website || '');

    if (honeypot) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return new Response(JSON.stringify({ error: 'Email non valida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const salt = process.env.IP_HASH_SALT || 'change-me';
    const ipHash = crypto
      .createHash('sha256')
      .update((clientAddress || '') + salt)
      .digest('hex');
    const ua = (request.headers.get('user-agent') || '').slice(0, 300);

    await sql`
      INSERT INTO waitlist (email, role, company, source, user_agent, ip_hash)
      VALUES (${email}, ${role}, ${company}, ${source}, ${ua}, ${ipHash})
      ON CONFLICT ((LOWER(email))) DO NOTHING
    `;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[waitlist] error', err);
    return new Response(JSON.stringify({ error: 'Errore interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
