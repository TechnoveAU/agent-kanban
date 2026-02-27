import { getDb } from './db';

export interface Agent {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface AgentRow {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

function rowToAgent(row: AgentRow): Agent {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
  };
}

export function getAllAgents(): Agent[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM agents ORDER BY created_at ASC')
    .all() as AgentRow[];
  return rows.map(rowToAgent);
}

export function getAgentById(id: string): Agent | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as AgentRow | undefined;
  return row ? rowToAgent(row) : undefined;
}

export interface CreateAgentInput {
  id?: string;
  name: string;
  description: string;
}

export function createAgent(input: CreateAgentInput): Agent {
  const db = getDb();
  const id = input.id?.trim() || `agent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  db.prepare(`
    INSERT INTO agents (id, name, description)
    VALUES (?, ?, ?)
  `).run(id, input.name, input.description);

  const row = db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as AgentRow;
  return rowToAgent(row);
}

export interface UpdateAgentInput {
  newId?: string;
  name: string;
  description: string;
}

export function updateAgent(id: string, input: UpdateAgentInput): Agent {
  const db = getDb();
  const current = db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as AgentRow | undefined;
  if (!current) throw new Error(`Agent ${id} not found`);

  const newId = input.newId?.trim() || id;

  db.prepare(`
    UPDATE agents SET id = ?, name = ?, description = ? WHERE id = ?
  `).run(newId, input.name, input.description, id);

  const row = db.prepare('SELECT * FROM agents WHERE id = ?').get(newId) as AgentRow;
  return rowToAgent(row);
}

export function deleteAgent(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM agents WHERE id = ?').run(id);
}
