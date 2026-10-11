// Run: deno test supabase/functions/freshdesk-proxy/ops.test.ts
// KAN-322: the proxy only allows the app's own Freshdesk operations.
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { OPERATIONS, resolve } from './ops.ts';

Deno.test('every call the app makes today is allowed', () => {
  const cases: [Record<string, unknown>, string, number?][] = [
    [{ endpoint: '/tickets', method: 'GET' }, 'list_tickets'],
    [{ endpoint: '/tickets', method: 'POST', body: {} }, 'create_ticket'],
    [{ endpoint: '/tickets/42', method: 'PUT', body: {} }, 'update_ticket', 42],
    [{ endpoint: '/tickets/42/conversations', method: 'GET' }, 'list_conversations', 42],
    [{ endpoint: '/tickets/42/activities' }, 'list_activities', 42],
    [{ endpoint: '/tickets/42/notes', method: 'POST', body: {} }, 'add_note', 42],
    [{ endpoint: '/agents', method: 'GET' }, 'list_agents'],
    [{ endpoint: '/groups', method: 'GET' }, 'list_groups'],
    [{ op: 'add_note', params: { ticketId: 7 }, body: {} }, 'add_note', 7],
  ];
  for (const [input, name, id] of cases) {
    const r = resolve(input);
    assertEquals(r?.name, name);
    if (id !== undefined) assertEquals(r?.ticketId, id);
  }
});

Deno.test('anything else is refused', () => {
  const bad: Record<string, unknown>[] = [
    { endpoint: '/tickets/42', method: 'DELETE' },
    { endpoint: '/contacts/1', method: 'DELETE' },
    { endpoint: '/contacts', method: 'GET' },
    { endpoint: '/settings/helpdesk', method: 'GET' },
    { endpoint: '/tickets/42/../../contacts', method: 'GET' },
    { endpoint: '/tickets?per_page=100', method: 'GET' },
    { endpoint: '/tickets/abc/notes', method: 'POST' },
    { endpoint: '/tickets', method: 'PUT' },
    { op: 'update_ticket', params: { ticketId: 0 } },
    { op: 'delete_ticket', params: { ticketId: 1 } },
    { op: '__proto__' },
    {},
  ];
  for (const input of bad) assertEquals(resolve(input), null, JSON.stringify(input));
});

Deno.test('no operation uses DELETE', () => {
  for (const op of Object.values(OPERATIONS)) assertEquals(['GET', 'POST', 'PUT'].includes(op.method), true);
});
