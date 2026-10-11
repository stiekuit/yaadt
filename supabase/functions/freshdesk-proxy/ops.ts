// The only Freshdesk operations the YAADT app may perform through freshdesk-proxy (KAN-322).
// Each one has a fixed method and path, and needs one of its permissions (admins are always allowed).
// There is deliberately no DELETE and no free-form path.

export type Method = 'GET' | 'POST' | 'PUT';
export type Operation = {
  method: Method;
  path: (ticketId?: number) => string;
  needsTicket: boolean;
  hasBody: boolean;
  permissions: string[];
  // How the app's existing { endpoint, method } calls map to this operation.
  legacy: RegExp;
};

const VIEW = ['ticket_view', 'tickets_access'];
const EDIT = ['ticket_edit', 'ticket_status_change', 'ticket_assign'];

export const OPERATIONS: Record<string, Operation> = {
  list_tickets: { method: 'GET', path: () => '/tickets', needsTicket: false, hasBody: false, permissions: VIEW, legacy: /^\/tickets$/ },
  create_ticket: { method: 'POST', path: () => '/tickets', needsTicket: false, hasBody: true, permissions: ['ticket_create'], legacy: /^\/tickets$/ },
  update_ticket: { method: 'PUT', path: (id) => `/tickets/${id}`, needsTicket: true, hasBody: true, permissions: EDIT, legacy: /^\/tickets\/(\d+)$/ },
  list_conversations: { method: 'GET', path: (id) => `/tickets/${id}/conversations`, needsTicket: true, hasBody: false, permissions: VIEW, legacy: /^\/tickets\/(\d+)\/conversations$/ },
  list_activities: { method: 'GET', path: (id) => `/tickets/${id}/activities`, needsTicket: true, hasBody: false, permissions: VIEW, legacy: /^\/tickets\/(\d+)\/activities$/ },
  add_note: { method: 'POST', path: (id) => `/tickets/${id}/notes`, needsTicket: true, hasBody: true, permissions: EDIT, legacy: /^\/tickets\/(\d+)\/notes$/ },
  list_agents: { method: 'GET', path: () => '/agents', needsTicket: false, hasBody: false, permissions: VIEW, legacy: /^\/agents$/ },
  list_groups: { method: 'GET', path: () => '/groups', needsTicket: false, hasBody: false, permissions: VIEW, legacy: /^\/groups$/ },
};

export type Resolved = { name: string; op: Operation; ticketId?: number; body?: unknown };

const ticketOk = (v: unknown) => (typeof v === 'number' || typeof v === 'string') && /^[1-9]\d{0,11}$/.test(String(v));

// Works out which allowed operation a request is, or null if it isn't one.
// Accepts the new shape { op, params: { ticketId }, body } and the app's existing { endpoint, method, body }.
// Anything else in the request (e.g. a caller-supplied domain or apiKey) is ignored.
export function resolve(input: Record<string, unknown>): Resolved | null {
  if (typeof input.op === 'string') {
    if (!Object.prototype.hasOwnProperty.call(OPERATIONS, input.op)) return null;
    const op = OPERATIONS[input.op];
    const params = (input.params ?? {}) as Record<string, unknown>;
    if (op.needsTicket && !ticketOk(params.ticketId)) return null;
    return { name: input.op, op, ticketId: op.needsTicket ? Number(params.ticketId) : undefined, body: op.hasBody ? input.body : undefined };
  }
  if (typeof input.endpoint === 'string') {
    const method = String(input.method ?? 'GET').toUpperCase();
    for (const [name, op] of Object.entries(OPERATIONS)) {
      if (op.method !== method) continue;
      const m = op.legacy.exec(input.endpoint);
      if (!m) continue;
      if (op.needsTicket && !ticketOk(m[1])) return null;
      return { name, op, ticketId: op.needsTicket ? Number(m[1]) : undefined, body: op.hasBody ? input.body : undefined };
    }
  }
  return null;
}
