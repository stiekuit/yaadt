export interface FreshdeskTicket {
  id: number;
  subject: string;
  description: string;
  status: number;
  priority: number;
  type: string;
  source: number;
  requester_id: number;
  responder_id?: number;
  company_id?: number;
  group_id?: number;
  created_at: string;
  updated_at: string;
  due_by?: string;
  fr_due_by?: string;
  is_escalated: boolean;
  description_text: string;
  spam: boolean;
  email_config_id?: number;
  custom_fields: Record<string, any>;
  tags: string[];
  cc_emails: string[];
  fwd_emails: string[];
  reply_cc_emails: string[];
  support_email: string;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  email: string;
  priority?: number;
  status?: number;
  type?: string;
  source?: number;
  responder_id?: number;
  group_id?: number;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface UpdateTicketData {
  subject?: string;
  description?: string;
  priority?: number;
  status?: number;
  type?: string;
  responder_id?: number;
  group_id?: number;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface CreateNoteData {
  body: string;
  private?: boolean;
  incoming?: boolean;
  notify_emails?: string[];
}

export class FreshdeskService {
  private domain: string;
  private apiKey: string;
  private baseUrl: string;

  constructor(domain: string, apiKey: string) {
    this.domain = domain;
    this.apiKey = apiKey;
    this.baseUrl = `https://${domain}.freshdesk.com/api/v2`;
  }

  private getAuthHeaders() {
    return {
      'Authorization': `Basic ${btoa(`${this.apiKey}:X`)}`,
      'Content-Type': 'application/json',
    };
  }

  async getTickets(params?: {
    page?: number;
    per_page?: number;
    updated_since?: string;
    include?: string[];
  }): Promise<FreshdeskTicket[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.updated_since) searchParams.append('updated_since', params.updated_since);
    if (params?.include) searchParams.append('include', params.include.join(','));

    const response = await fetch(
      `${this.baseUrl}/tickets?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tickets: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getTicket(id: number): Promise<FreshdeskTicket> {
    const response = await fetch(`${this.baseUrl}/tickets/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ticket: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async createTicket(ticketData: CreateTicketData): Promise<FreshdeskTicket> {
    const response = await fetch(`${this.baseUrl}/tickets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to create ticket: ${response.status} ${response.statusText} - ${errorData}`);
    }

    return response.json();
  }

  async updateTicket(id: number, updateData: UpdateTicketData): Promise<FreshdeskTicket> {
    const response = await fetch(`${this.baseUrl}/tickets/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to update ticket: ${response.status} ${response.statusText} - ${errorData}`);
    }

    return response.json();
  }

  async deleteTicket(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tickets/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ticket: ${response.status} ${response.statusText}`);
    }
  }

  async addNoteToTicket(ticketId: number, noteData: CreateNoteData): Promise<any> {
    const response = await fetch(`${this.baseUrl}/tickets/${ticketId}/notes`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to add note to ticket: ${response.status} ${response.statusText} - ${errorData}`);
    }

    return response.json();
  }

  // Status constants
  static readonly STATUS = {
    OPEN: 2,
    PENDING: 3,
    RESOLVED: 4,
    CLOSED: 5,
  };

  // Priority constants
  static readonly PRIORITY = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4,
  };

  // Source constants
  static readonly SOURCE = {
    EMAIL: 1,
    PORTAL: 2,
    PHONE: 3,
    CHAT: 7,
    FEEDBACK_WIDGET: 9,
    OUTBOUND_EMAIL: 10,
  };
}
