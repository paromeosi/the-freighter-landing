import type { APIRoute } from 'astro';
import { sql } from '../../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const auth = request.headers.get('authorization') || '';
  const expected =
    'Basic ' + Buffer.from('admin:' + (process.env.ADMIN_PASSWORD || '')).toString('base64');
  if (!process.env.ADMIN_PASSWORD || auth !== expected) {
    return new Response('Unauthorized', { status: 401 });
  }

  await sql`TRUNCATE waitlist RESTART IDENTITY`;
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
