import type { APIRoute } from 'astro';
import { sql } from '../../../lib/db';

export const prerender = false;

function csvEscape(v: unknown): string {
  const s = v == null ? '' : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export const GET: APIRoute = async ({ request }) => {
  const auth = request.headers.get('authorization') || '';
  const expected =
    'Basic ' + Buffer.from('admin:' + (process.env.ADMIN_PASSWORD || '')).toString('base64');
  if (!process.env.ADMIN_PASSWORD || auth !== expected) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
    });
  }

  const rows = (await sql`
    SELECT email, role, company, source, created_at
    FROM waitlist
    ORDER BY created_at DESC
  `) as any[];

  const header = 'email,role,company,source,created_at';
  const body = rows
    .map((r: any) =>
      [r.email, r.role, r.company, r.source, r.created_at].map(csvEscape).join(',')
    )
    .join('\n');
  const csv = header + '\n' + body + '\n';

  const filename = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};
