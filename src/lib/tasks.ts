import { randomUUID } from 'crypto';
import { getDb } from './db';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'pending' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  agentId?: string;
  tags: string[];
  commentCount: number;
  timeEstimate: string;
  assignee?: {
    name: string;
    avatar: string;
  };
}

interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  agent_id: string | null;
  tags: string;
  comment_count: number;
  time_estimate: string;
  assignee_name: string | null;
  assignee_avatar: string | null;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    agentId: row.agent_id ?? undefined,
    tags: JSON.parse(row.tags) as string[],
    commentCount: row.comment_count,
    timeEstimate: row.time_estimate,
    assignee:
      row.assignee_name && row.assignee_avatar
        ? { name: row.assignee_name, avatar: row.assignee_avatar }
        : undefined,
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  agentId?: string;
}

export function createTask(input: CreateTaskInput): Task {
  const db = getDb();
  const id = randomUUID();
  db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, tags, comment_count, time_estimate, agent_id)
    VALUES (?, ?, ?, ?, ?, '[]', 0, '', ?)
  `).run(
    id,
    input.title,
    input.description ?? '',
    input.status ?? 'backlog',
    input.priority ?? 'medium',
    input.agentId ?? null,
  );
  return rowToTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow);
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  agentId?: string;
}

export function updateTask(id: string, input: UpdateTaskInput): Task {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
  if (!row) throw new Error(`Task ${id} not found`);

  db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, status = ?, priority = ?, agent_id = ?
    WHERE id = ?
  `).run(
    input.title ?? row.title,
    input.description ?? row.description,
    input.status ?? row.status,
    input.priority ?? row.priority,
    input.agentId !== undefined ? (input.agentId || null) : row.agent_id,
    id,
  );
  return rowToTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow);
}

/** Return all tasks grouped by their status column. */
export function getAllTasksByStatus(): Record<TaskStatus, Task[]> {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM tasks ORDER BY created_at ASC')
    .all() as TaskRow[];

  const grouped: Record<TaskStatus, Task[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    pending: [],
    done: [],
  };

  for (const row of rows) {
    grouped[row.status as TaskStatus].push(rowToTask(row));
  }

  return grouped;
}

/** Return every task as a flat array. */
export function getAllTasks(): Task[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM tasks ORDER BY created_at ASC')
    .all() as TaskRow[];
  return rows.map(rowToTask);
}

/** Return a single task by id, or null. */
export function getTaskById(id: string): Task | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
  return row ? rowToTask(row) : null;
}
