
export interface FreshdeskAgent {
  id: number;
  contact: {
    name: string;
    email: string;
  };
  active: boolean;
  available: boolean;
  occasional: boolean;
  signature: string;
  ticket_scope: number;
  group_ids: number[];
  role_ids: number[];
  skill_ids: number[];
  created_at: string;
  updated_at: string;
}

export interface FreshdeskGroup {
  id: number;
  name: string;
  description: string;
  escalate_to: number;
  unassigned_for: string;
  agent_ids: number[];
  created_at: string;
  updated_at: string;
}
